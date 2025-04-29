module.exports = {
  preset: 'ts-jest',
  rootDir: '.',
  moduleNameMapper: {
    '^@mocks/(.*)$': '<rootDir>/tests/utils/mocks/$1',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/tests/**/*.test.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  coverageDirectory: './coverage',
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: ['./tests/utils/setup.ts']
};