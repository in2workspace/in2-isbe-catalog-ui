import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!@angular|@ngx-translate/core|@fortawesome/angular-fontawesome|ngx-markdown|@ctrl/ngx-emoji-mart|ngx-file-drop)',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  clearMocks: true,
};

export default config;
