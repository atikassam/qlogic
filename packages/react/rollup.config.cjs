const { withNx } = require('@nx/rollup/with-nx');
const url = require('@rollup/plugin-url');
const svg = require('@svgr/rollup');
const css = require('rollup-plugin-import-css')
const OMT = require("@surma/rollup-plugin-off-main-thread");

function removeSourceMappingURL() {
  return {
    name: 'remove-source-mapping-url', // Name of the plugin
    transform(code, id) {
      if (id.endsWith('.js')) {
        // Remove the //# sourceMappingURL comment
        const updatedCode = code.replace(/\/\/# sourceMappingURL=.*\.map\s*$/gm, '');
        return {
          code: updatedCode,
          map: null, // Don't generate a source map for this transformation
        };
      }
      return null; // If not a .js file, skip
    },
  };
}

module.exports = withNx(
  {
    main: './src/index.ts',
    additionalEntryPoints: ['./src/execute-unsafe-code.worker.ts'],
    outputPath: './dist',
    tsConfig: './tsconfig.lib.json',
    compiler: 'babel',
    external: ['react', 'react-dom', 'react/jsx-runtime', '@mui/material', '@emotion/styled', '@emotion/react'],
    format: ['esm', 'cjs', 'amd'],
    assets: [{ input: '.', output: '.', glob: 'README.md' }],
  },
  {
    plugins: [
      // OMT({}),
      removeSourceMappingURL(),
      css(),
      svg({
        svgo: false,
        titleProp: true,
        ref: true,
      }),
      // url({
      //   include: ['**/*.worker.ts'], // Ensure worker files are included
      //   // limit: 0, // Force output as separate files (not inlined)
      //   fileName: '[name].worker.js', // Name pattern for worker files
      // }),
      url({
        limit: 10000, // 10kB
      }),
    ]
  }
);
