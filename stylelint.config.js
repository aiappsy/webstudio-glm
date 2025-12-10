module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [true, { ignoreAtRules: ['tailwindcss/at-apply-no-empty'] }],
  },
}