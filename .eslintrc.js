module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    babelOptions: {
      configFile: './babel.config.json',
    },
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  rules: {
    semi: 'off',
    'comma-dangle': 'off',
  },
}
