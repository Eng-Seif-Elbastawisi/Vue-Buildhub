import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@vue/compiler-sfc';
import ts from 'typescript';

async function vueFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => entry.name !== '__tests__')
      .map((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? vueFiles(file) : file.endsWith('.vue') ? [file] : [];
      }),
  );
  return nested.flat();
}

const files = await vueFiles('src');
const components = await Promise.all(
  files.map(async (file) => {
    const source = await readFile(file, 'utf8');
    const { descriptor } = parse(source, { filename: file });
    const template = descriptor.template?.content ?? '';
    const scripts = [descriptor.script?.content, descriptor.scriptSetup?.content]
      .filter(Boolean)
      .join('\n');
    const tags = [...template.matchAll(/<([A-Za-z][\w.-]*)\b/g)].map((match) => match[1]);
    const importPaths = ts
      .createSourceFile(file, scripts, ts.ScriptTarget.Latest)
      .statements.filter(ts.isImportDeclaration)
      .filter((declaration) => ts.isStringLiteral(declaration.moduleSpecifier))
      .map((declaration) => declaration.moduleSpecifier.text)
      .filter((specifier) => specifier.endsWith('.vue'));
    const lazyPaths = [...scripts.matchAll(/import\(['"]([^'"]+\.vue)['"]\)/g)].map(
      (match) => match[1],
    );
    const dependencies = [...new Set([...importPaths, ...lazyPaths])]
      .map((specifier) =>
        specifier.startsWith('@/')
          ? `src/${specifier.slice(2)}`
          : path.normalize(path.join(path.dirname(file), specifier)),
      )
      .filter((dependency) => files.includes(dependency));
    return {
      file,
      module: file.startsWith('src/modules/')
        ? file
            .split('/')
            .slice(2, /^(MainOrganization|MainAdmin|shared)$/.test(file.split('/')[2]) ? 4 : 3)
            .join('/')
        : file.split('/').slice(1, 3).join('/'),
      dependencies,
      controls: [
        ...new Set(
          tags.filter((tag) =>
            /input|select|date|calendar|textarea|check|radio|switch|upload|autocomplete/i.test(tag),
          ),
        ),
      ],
      tables: [...new Set(tags.filter((tag) => /table|pagination/i.test(tag)))],
      dialogs: [...new Set(tags.filter((tag) => /dialog|drawer|popover|modal/i.test(tag)))],
      formLayout: tags.includes('StandardFormLayout'),
      contentControls: template.includes('workspace-control'),
      contentTable: template.includes('workspace-data-table'),
      contentDialog: template.includes('workspace-dialog'),
      actionsSlot: template.includes('#actions'),
      nativeForms: tags.filter((tag) => tag === 'form').length,
      localStyles: descriptor.styles.length > 0,
      literalColors: descriptor.styles.reduce(
        (count, style) => count + (style.content.match(/#[\da-f]{3,8}\b|rgba?\(/gi)?.length ?? 0),
        0,
      ),
    };
  }),
);
const byFile = new Map(components.map((component) => [component.file, component]));
function reachable(file, visited = new Set()) {
  if (visited.has(file)) return visited;
  visited.add(file);
  for (const dependency of byFile.get(file)?.dependencies ?? []) reachable(dependency, visited);
  return visited;
}
const routes = JSON.parse(await readFile('docs/redesign/routes.json', 'utf8')).map((route) => ({
  ...route,
  contentComponents: [...reachable(route.component)].filter((file) =>
    file.startsWith('src/modules/'),
  ),
}));
await writeFile(
  'docs/redesign/components.json',
  JSON.stringify({ components, routes }, null, 2) + '\n',
);
console.log(
  `Inventoried ${components.length} Vue components and ${routes.length} declared routes.`,
);
