import { expect, galata, test } from '@jupyterlab/galata';
import * as path from 'path';

const files = [
  'julia.jl',
  'javascript.js',
  'python.py',
  'R.R',
  'typescript.ts'
];

test.use({
  tmpPath: 'picker-test'
});

test.describe('Color parsing', () => {
  test.beforeAll(async ({ request, tmpPath }) => {
    const contents = galata.newContentsHelper(request);
    await contents.uploadDirectory(path.resolve(__dirname, './files'), tmpPath);
  });

  for (let file of files) {
    test(`should render color pickers in ${file}`, async ({
      page,
      tmpPath
    }) => {
      await page.filebrowser.open(`${tmpPath}/${file}`);
      const editorLocator = page.locator(
        '.jp-FileEditorCodeWrapper .cm-content'
      );
      expect(await editorLocator!.screenshot()).toMatchSnapshot(`${file}.png`);
    });
  }
});
