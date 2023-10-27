const commonOptions = {
  resetMocks: true,
  coverageDirectory: 'coverage'
}

const projects = [
  {
    displayName: 'ts',
    testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
    preset: 'ts-jest/presets/js-with-ts',
    testEnvironment: 'jsdom'
  },
  {
    displayName: 'ssr-ts',
    testMatch: ['**/?(*.)+(spec|test).ssr.ts?(x)'],
    preset: 'ts-jest/presets/js-with-ts',
    testEnvironment: 'node'
  }
]

module.exports = {
  projects: projects.map(p => ({ ...p, ...commonOptions })),
  roots: ['./src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
}
