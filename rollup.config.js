import eslint from 'rollup-plugin-eslint'
import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/js/app.js',
  format: 'cjs',
  dest: 'public/js/bundle.js',
  sourceMap: 'inline',
  plugins: [
    eslint(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
