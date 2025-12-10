module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always'],
    'footer-max-line-length': [1, 'always'],
  },
}