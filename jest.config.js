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
  }
]

module.exports = {
  projects
}
