module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  displayName: 'CLS',
  moduleDirectories: ['node_modules', './'],
  modulePaths: ['node_modules', './'],
  name: 'CLS',
  rootDir: './../../',
  testMatch: ['<rootDir>/tests/cls/**/*.test.ts', '<rootDir>/tests/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
