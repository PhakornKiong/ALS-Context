module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  displayName: 'AsyncLocalStorage',
  moduleDirectories: ['node_modules', './'],
  modulePaths: ['node_modules', './'],
  name: 'ALS',
  rootDir: './../../',
  testMatch: ['<rootDir>/tests/als/**/*.test.ts', '<rootDir>/tests/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
