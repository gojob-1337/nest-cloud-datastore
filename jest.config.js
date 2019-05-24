module.exports = {
  testEnvironment: 'node',
  notify: true,
  testRegex: '((src|libs)/.*\\.(spec|(integration|e2e)-test))\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  roots: [
    '<rootDir>/src/',
    '<rootDir>/libs/'
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/app.controller.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/vendor/**',
    '!src/**/*.d.ts',
    '!src/**/*.*test.*ts',
  ],
  coverageReporters: ['json', 'lcov'],
  coverageDirectory: 'coverage',
  verbose: true,
  watchPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
};
