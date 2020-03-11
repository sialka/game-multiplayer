module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base', 'prettier'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "no-console": "off",
    "guard-for-in": "off",
    "no-restricted-syntax": "off",
    "no-undef": "off",
    "no-shadow": "off",
    "no-return-assign": "off",
    "no-unused-vars": "off",
    "no-use-before-define": "off",
    "func-names": "off",
    "consistent-return": "off",
  },
};
