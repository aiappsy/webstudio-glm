module.exports = {
  all: true,
  include: ['src/**/*.{js,jsx,ts,tsx}'],
  exclude: [
    'src/**/*.test.{js,jsx,ts,tsx}',
    'src/**/*.spec.{js,jsx,ts,tsx}',
    'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
  ],
  reporter: ['text', 'html', 'lcov'],
  reporterOptions: {
    html: {
      sourceMap: true,
    output: './coverage/html',
    },
  },
  check-coverage: true,
  branches: 80,
  functions: 80,
  lines: 80,
  statements: 80,
}