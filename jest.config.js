module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  reporters: ['default', 'jest-junit'],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'text', 'cobertura'],
  testMatch: ['<rootDir>/tests/**/*.(spec|test).ts|tsx'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/coverage/'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
