const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const uglify = require('rollup-plugin-minify-es')
const license = require('rollup-plugin-license')
const args = process.argv

const format = args.includes('es') ? 'es' : 'umd'
rollup.rollup({
  input: 'src/index.js',
  plugins: [
    commonjs(),
    resolve(),
    uglify({
      output: {
        comments: 'some'
      }
    }),
    license({
      banner: `
        Wue v<%= pkg.version %>
        (c) 2018-<%= moment().format('YYYY') %> huangwutao
        Released under the MIT @License.
        document -> https://taoja.github.io/wue
        github -> https://github.com/Taoja/wue
      `
    })
  ]
}).then(function (bundle) {
  bundle.write({
    name: 'Wue',
    format: format,
    file: `dist/wue.${format == 'umd' ? 'min' : format}.js`,
  })
})