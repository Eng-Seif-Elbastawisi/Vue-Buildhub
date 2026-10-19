import { createServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const [modules, shared, admin, helpers] = await Promise.all([
    server.ssrLoadModule('/src/router/routes/modules/index.ts'),
    server.ssrLoadModule('/src/router/routes/shared/index.ts'),
    server.ssrLoadModule('/src/router/routes/admin/index.ts'),
    server.ssrLoadModule('/src/router/helpers/index.ts'),
  ]);
  const portals = {
    organization: [
      ...modules.dashboardRoutes,
      ...helpers.addSuffix(shared.sharedRoutes, 'Organization'),
    ],
    admin: [...admin.adminRoutes, ...helpers.addSuffix(shared.sharedRoutes, 'Admin')],
  };
  const inventory = [];
  for (const [portal, routes] of Object.entries(portals)) {
    for (const route of routes) {
      const component = String(route.component).match(/(?:src\/views|@\/views)[^"')]+/)?.[0];
      if (!component) throw new Error(`Cannot inventory component for ${portal}/${route.path}`);
      const sourcePath = component.replace(/^@\//, 'src/');
      await readFile(sourcePath, 'utf8');
      inventory.push({
        portal,
        path: `/${portal}/${route.path}`,
        name: route.name,
        component: sourcePath,
        meta: route.meta ?? {},
      });
    }
  }
  await writeFile('docs/redesign/routes.json', JSON.stringify(inventory, null, 2) + '\n');
  console.log(
    `Inventoried ${inventory.length} route declarations. /mainportal aliases organization routes.`,
  );
} finally {
  await server.close();
}
