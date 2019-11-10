export function mockCancelToken(axios) {
  const cancel = jest.fn()
  const token = {
    promise: Promise.resolve({ message: 'none' }),
    reason: { message: 'none' },
    throwIfRequested() {}
  }

  const CancelToken = Object.assign(jest.fn(), {
    source: () => ({
      cancel,
      token
    })
  })

  axios.CancelToken = CancelToken

  return { cancel, token }
}
