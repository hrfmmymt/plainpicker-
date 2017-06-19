import eslint from 'rollup-plugin-eslint'
import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/js/plainpicker.js',
  format: 'cjs',
  dest: 'public/js/plainpicker.js',
  sourceMap: 'inline',
  plugins: [
    eslint(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
