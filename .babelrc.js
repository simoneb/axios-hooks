const { NODE_ENV, BABEL_ENV } = process.env
const cjs = NODE_ENV === 'test' || BABEL_ENV === 'commonjs'
const loose = true

module.exports = {
  presets: [['@babel/preset-env', { loose, modules: false }]],
  plugins: [
    ['@babel/plugin-transform-object-rest-spread', { loose }],
    cjs && ['@babel/transform-modules-commonjs', { loose }],
    ['@babel/transform-runtime', { useESModules: !cjs }]
  ].filter(Boolean),
  env: {
    test: {
      presets: ['@babel/preset-env', '@babel/preset-react']
    }
  }
}
