module.exports = mockAxios

function mockAxios() {
  return new Promise((resolve, reject) => {
    mockAxios.resolvePromise = resolve
    mockAxios.rejectPromise = reject
  })
}
