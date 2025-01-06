const { withNx } = require('@nx/rollup/with-nx');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: './dist',
    tsConfig: './tsconfig.lib.json',
    compiler: 'swc',
    format: ['cjs'],
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@mui/material',
      '@emotion/styled',
      '@emotion/react',
      'web-worker',
      'jsdom',
      '@qlogic/react'
    ]
  },
  {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    // e.g.
    // output: { sourcemap: true },
  }
);
