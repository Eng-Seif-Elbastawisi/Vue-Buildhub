import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('BrandDialog source', () => {
  it('declares a visible v-model contract for the dialog', () => {
    const source = readFileSync(
      'src/modules/Brand/presentation/subComponent/BrandDialog.vue',
      'utf8',
    );
    expect(source).toContain('visible: boolean');
    expect(source).toContain("'update:visible'");
    expect(source).toContain('Dialog');
  });
});
