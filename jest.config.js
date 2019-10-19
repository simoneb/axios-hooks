const projects = [
  {
    clearMocks: true,
    coverageDirectory: 'coverage',
    testMatch: ['**/?(*.)+(spec|test).js?(x)']
  },
  {
    clearMocks: true,
    coverageDirectory: 'coverage',
    testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
    preset: 'ts-jest/presets/js-with-ts'
  },
  {
    clearMocks: true,
    coverageDirectory: 'coverage',
    testMatch: ['**/?(*.)+(spec|test).ssr.js?(x)'],
    testEnvironment: 'node'
  },
  {
    clearMocks: true,
    coverageDirectory: 'coverage',
    testMatch: ['**/?(*.)+(spec|test).ssr.ts?(x)'],
    preset: 'ts-jest/presets/js-with-ts',
    testEnvironment: 'node'
  }
]

module.exports = {
  projects
}
