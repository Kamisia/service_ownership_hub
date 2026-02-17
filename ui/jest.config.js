const { stratoPreset } = require('@dynatrace/strato-components-preview-testing/jest/preset');

/** @type {import('jest').Config} */
module.exports = {
  ...stratoPreset,
  rootDir: '..',
  preset: 'ts-jest',
  displayName: 'ui',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/ui'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/ui/tsconfig.json' }],
  },
  setupFilesAfterEnv: [
    // Strato jest mocks
    '@dynatrace/strato-components-preview-testing/jest/setup',
    '<rootDir>/ui/jest-setup.ts',
  ],
  moduleNameMapper: {
    ...stratoPreset.moduleNameMapper,
    '^app/(.*)$': '<rootDir>/ui/app/$1',
  },
};
