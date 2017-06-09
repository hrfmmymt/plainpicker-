import eslint from 'rollup-plugin-eslint'

export default {
  entry: 'src/js/app.js',
  format: 'cjs',
  dest: 'public/js/bundle.js',
  sourceMap: 'inline',
  plugins: [
    eslint()
  ]
}
