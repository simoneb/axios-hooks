import { renderHook, act } from '@testing-library/react-hooks'
import axios from 'axios'

import useAxios, { configure, resetConfigure } from './'

jest.mock('axios')

it('should set loading to true', async () => {
  axios.mockImplementation(() => new Promise(() => null))

  const { result } = renderHook(() => useAxios(''))

  expect(result.current[0].loading).toBe(true)
})

it('should set loading to false when request completes and returns data', async () => {
  axios.mockResolvedValueOnce({ data: 'whatever' })

  const { result, waitForNextUpdate } = renderHook(() => useAxios(''))

  await waitForNextUpdate()

  expect(result.current[0].loading).toBe(false)
  expect(result.current[0].data).toBe('whatever')
})

it('should set the response', async () => {
  const response = { data: 'whatever' }

  axios.mockResolvedValueOnce(response)

  const { result, waitForNextUpdate } = renderHook(() => useAxios(''))

  await waitForNextUpdate()

  expect(result.current[0].loading).toBe(false)
  expect(result.current[0].response).toBe(response)
})

it('should reset error when request completes and returns data', async () => {
  const error = new Error('boom')

  axios.mockRejectedValue(error)

  const { result, waitForNextUpdate } = renderHook(() => useAxios(''))

  await waitForNextUpdate()

  expect(result.current[0].error).toBe(error)

  axios.mockResolvedValue({ data: 'whatever' })

  // Refetch
  act(() => {
    result.current[1]()
  })

  await waitForNextUpdate()

  expect(result.current[0].error).toBe(null)
})

it('should set loading to false when request completes and returns error', async () => {
  const error = new Error('boom')

  axios.mockRejectedValue(error)

  const { result, waitForNextUpdate } = renderHook(() => useAxios(''))

  await waitForNextUpdate()

  expect(result.current[0].loading).toBe(false)
  expect(result.current[0].error).toBe(error)
})

it('should refetch', async () => {
  axios.mockResolvedValue({ data: 'whatever' })

  const { result, waitForNextUpdate } = renderHook(() => useAxios(''))

  await waitForNextUpdate()

  act(() => {
    result.current[1]()
  })

  expect(result.current[0].loading).toBe(true)
  expect(axios).toHaveBeenCalledTimes(2)

  await waitForNextUpdate()
})

describe('refetch', () => {
  describe('when axios resolves', () => {
    it('should resolve to the response by default', async () => {
      const response = { data: 'whatever' }

      axios.mockResolvedValue(response)

      const {
        result: {
          current: [, refetch]
        }
      } = renderHook(() => useAxios(''))

      await act(async () => {
        expect(refetch()).resolves.toEqual(response)
      })
    })

    it('should resolve to the response when using cache', async () => {
      const response = { data: 'whatever' }

      axios.mockResolvedValue(response)

      const {
        result: {
          current: [, refetch]
        }
      } = renderHook(() => useAxios(''))

      await act(async () => {
        expect(refetch({}, { useCache: true })).resolves.toEqual(response)
      })
    })
  })

  describe('when axios rejects', () => {
    it('should reject with the error by default', async () => {
      const error = new Error('boom')

      axios.mockRejectedValue(error)

      const {
        result: {
          current: [, refetch]
        }
      } = renderHook(() => useAxios(''))

      await act(async () => {
        expect(refetch()).rejects.toEqual(error)
      })
    })

    it('should reject with the error by when using cache', async () => {
      const error = new Error('boom')

      axios.mockRejectedValue(error)

      const {
        result: {
          current: [, refetch]
        }
      } = renderHook(() => useAxios(''))

      await act(async () => {
        expect(refetch({}, { useCache: true })).rejects.toEqual(error)
      })
    })
  })
})

it('should return the same reference to the fetch function', async () => {
  axios.mockResolvedValue({ data: 'whatever' })

  const { result, rerender, waitForNextUpdate } = renderHook(() => useAxios(''))

  const firstRefetch = result.current[1]

  rerender()
  await waitForNextUpdate()

  expect(result.current[1]).toBe(firstRefetch)
})

describe('manual option', () => {
  it('should set loading to false', () => {
    const { result } = renderHook(() => useAxios('', { manual: true }))

    expect(result.current[0].loading).toBe(false)
  })

  it('should not execute request', () => {
    renderHook(() => useAxios('', { manual: true }))

    expect(axios).not.toHaveBeenCalled()
  })

  it('should execute request manually and skip cache by default', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAxios('', { manual: true })
    )

    axios.mockResolvedValueOnce({ data: 'whatever' })

    act(() => {
      result.current[1]()
    })

    expect(result.current[0].loading).toBe(true)

    await waitForNextUpdate()

    expect(result.current[0].loading).toBe(false)
    expect(result.current[0].data).toBe('whatever')

    expect(axios).toHaveBeenCalledTimes(1)
    expect(axios).toHaveBeenCalledWith(
      expect.not.objectContaining({ adapter: expect.any(Function) })
    )
  })

  it('should allow using the cache', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAxios('', { manual: true })
    )

    axios.mockResolvedValueOnce({ data: 'whatever' })

    act(() => {
      result.current[1]({}, { useCache: true })
    })

    await waitForNextUpdate()

    expect(axios).toHaveBeenCalledTimes(1)
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({ adapter: expect.any(Function) })
    )
  })
})

describe('useCache option', () => {
  it('should use cache by default', async () => {
    const { waitForNextUpdate } = renderHook(() => useAxios(''))

    axios.mockResolvedValueOnce({ data: 'whatever' })

    await waitForNextUpdate()

    expect(axios).toHaveBeenCalledTimes(1)
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({ adapter: expect.any(Function) })
    )
  })

  it('should allow disabling cache', async () => {
    const { waitForNextUpdate } = renderHook(() =>
      useAxios('', { useCache: false })
    )

    axios.mockResolvedValueOnce({ data: 'whatever' })

    await waitForNextUpdate()

    expect(axios).toHaveBeenCalledTimes(1)
    expect(axios).toHaveBeenCalledWith(
      expect.not.objectContaining({ adapter: expect.any(Function) })
    )
  })
})

describe('configure', () => {
  afterEach(() => resetConfigure())

  it('should provide a custom implementation of axios', async () => {
    const mockAxios = jest.fn(() => new Promise(() => null))

    configure({ axios: mockAxios })

    renderHook(() => useAxios(''))

    expect(mockAxios).toHaveBeenCalled()
  })
})

describe('component dismount', () => {
  let originalConsoleError
  let mockConsoleError

  beforeEach(() => {
    originalConsoleError = console.error
    mockConsoleError = jest.fn((...args) =>
      originalConsoleError.apply(console, args)
    )

    console.error = mockConsoleError
    axios.mockReset()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('should not update state after the component is destroyed for automatic', async () => {
    let resolve = null
    axios.mockImplementationOnce(() => {
      return new Promise(resolver => {
        resolve = resolver
      })
    })
    const { result, unmount } = renderHook(() => useAxios(''))

    expect(resolve).not.toBeNull()
    expect(result.current[0].loading).toBe(true)
    unmount()

    await act(async () => {
      resolve({ data: 'whatever' })
    })

    expect(mockConsoleError).not.toHaveBeenCalled()
  })

  it('should not update state after the component is destroyed for manual', async () => {
    let resolve = null
    axios.mockImplementationOnce(() => {
      return new Promise(resolver => {
        resolve = resolver
      })
    })
    const { result, unmount } = renderHook(() => useAxios('', { manual: true }))

    act(() => {
      result.current[1]()
    })

    expect(resolve).not.toBeNull()
    unmount()

    await act(async () => {
      resolve({ data: 'whatever' })
    })

    expect(mockConsoleError).not.toHaveBeenCalled()
  })
})
