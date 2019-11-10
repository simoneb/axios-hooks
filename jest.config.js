const commonOptions = {
  resetMocks: true,
  coverageDirectory: 'coverage',
  setupFiles: ['./test/setupTests.js']
}

const projects = [
  {
    displayName: 'js',
    testMatch: ['**/?(*.)+(spec|test).js?(x)']
  },
  {
    displayName: 'ts',
    testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
    preset: 'ts-jest/presets/js-with-ts'
  },
  {
    displayName: 'ssr-js',
    testMatch: ['**/?(*.)+(spec|test).ssr.js?(x)'],
    testEnvironment: 'node'
  },
  {
    displayName: 'ssr-ts',
    testMatch: ['**/?(*.)+(spec|test).ssr.ts?(x)'],
    preset: 'ts-jest/presets/js-with-ts',
    testEnvironment: 'node'
  }
]

module.exports = {
  projects: projects.map(p => ({ ...p, ...commonOptions }))
}
