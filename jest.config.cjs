const collectCoverage = process.env.COVERAGE === 'true';

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^.+\\.css$': '<rootDir>/tests/styleMock.js',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/features/(.*)$': '<rootDir>/features/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/config$': '<rootDir>/config/index.ts',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^@/tenancy/(.*)$': '<rootDir>/tenancy/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
    '^@/theme/(.*)$': '<rootDir>/theme/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/.serverless/'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/.serverless/', '<rootDir>/tests/e2e/', '\\.stub\\.tsx?$', '_barrel\\.ts$'],
  collectCoverage,
  collectCoverageFrom: collectCoverage
    ? [
        'components/**/*.{ts,tsx}',
        'features/**/*.{ts,tsx}',
        'services/**/*.{ts,tsx}',
        'tenancy/**/*.{ts,tsx}',
        'config/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        '!**/*.d.ts',
      ]
    : undefined,
  coverageThreshold: collectCoverage
    ? {
        global: {
          branches: 0.9,
          functions: 0.9,
          lines: 0.9,
          statements: 0.9,
        },
      }
    : undefined,
};


