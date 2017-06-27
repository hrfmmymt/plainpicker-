import eslint from 'rollup-plugin-eslint'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'

export default {
  entry: 'src/js/app.js',
  format: 'cjs',
  dest: 'public/js/bundle.js',
  sourceMap: true,
  plugins: [
    eslint(),
    babel({
      exclude: 'node_modules/**'
    }),
    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    (process.env.NODE_ENV === 'production' && uglify())
  ]
}
