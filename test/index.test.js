import { renderHook, act } from '@testing-library/react-hooks'
import axios from 'axios'

import useAxios, { configure, resetConfigure } from '../'
import { mockCancelToken } from './testUtils'

jest.mock('axios')

let cancel
let token

beforeEach(() => {
  ;({ cancel, token } = mockCancelToken(axios))
})

it('should set loading to true', async () => {
  axios.mockResolvedValueOnce({ data: 'whatever' })

  const { result, waitForNextUpdate } = renderHook(() => useAxios(''))

  expect(result.current[0].loading).toBe(true)

  await waitForNextUpdate()
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

  axios.mockRejectedValueOnce(error)

  const { result, waitForNextUpdate } = renderHook(() => useAxios(''))

  await waitForNextUpdate()

  expect(result.current[0].error).toBe(error)

  axios.mockResolvedValueOnce({ data: 'whatever' })

  // Refetch
  act(() => {
    result.current[1]()
  })

  await waitForNextUpdate()

  expect(result.current[0].error).toBe(null)
})

it('should set loading to false when request completes and returns error', async () => {
  const error = new Error('boom')

  axios.mockRejectedValueOnce(error)

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

describe('cancellation', () => {
  it('should cancel the outstanding request when the component unmounts', async () => {
    axios.mockResolvedValueOnce({ data: 'whatever' })

    const { waitForNextUpdate, unmount } = renderHook(() => useAxios(''))

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        cancelToken: token
      })
    )

    await waitForNextUpdate()

    unmount()

    expect(cancel).toHaveBeenCalled()
  })

  it('should cancel the outstanding request when the component refetches', async () => {
    axios.mockResolvedValue({ data: 'whatever' })

    const { waitForNextUpdate, rerender } = renderHook(
      props => useAxios(props),
      { initialProps: 'initial config' }
    )

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        cancelToken: token
      })
    )

    await waitForNextUpdate()

    rerender('new config')

    expect(cancel).toHaveBeenCalled()

    await waitForNextUpdate()
  })

  it('should not cancel the outstanding request when the component rerenders with same config', async () => {
    axios.mockResolvedValue({ data: 'whatever' })

    const { waitForNextUpdate, rerender } = renderHook(
      props => useAxios(props),
      { initialProps: 'initial config' }
    )

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        cancelToken: token
      })
    )

    await waitForNextUpdate()

    rerender()

    expect(cancel).not.toHaveBeenCalled()
  })

  it('should cancel the outstanding manual refetch when the component unmounts', async () => {
    const { result, waitForNextUpdate, unmount } = renderHook(() =>
      useAxios('', { manual: true })
    )

    axios.mockResolvedValueOnce({ data: 'whatever' })

    act(() => {
      result.current[1]()
    })

    expect(axios).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cancelToken: token
      })
    )

    await waitForNextUpdate()

    unmount()

    expect(cancel).toHaveBeenCalled()
  })

  it('should cancel the outstanding manual refetch when the component refetches', async () => {
    axios.mockResolvedValue({ data: 'whatever' })

    const { result, waitForNextUpdate, rerender } = renderHook(
      config => useAxios(config),
      { initialProps: '' }
    )

    act(() => {
      result.current[1]()
    })

    expect(axios).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cancelToken: token
      })
    )

    await waitForNextUpdate()

    rerender('new config')

    expect(cancel).toHaveBeenCalled()

    await waitForNextUpdate()
  })
})

describe('refetch', () => {
  describe('when axios resolves', () => {
    it('should resolve to the response by default', async () => {
      const response = { data: 'whatever' }

      axios.mockResolvedValue(response)

      const {
        result: {
          current: [, refetch]
        },
        waitForNextUpdate
      } = renderHook(() => useAxios(''))

      act(() => {
        expect(refetch()).resolves.toEqual(response)
      })

      await waitForNextUpdate()
    })

    it('should resolve to the response when using cache', async () => {
      const response = { data: 'whatever' }

      axios.mockResolvedValue(response)

      const {
        result: {
          current: [, refetch]
        },
        waitForNextUpdate
      } = renderHook(() => useAxios(''))

      act(() => {
        expect(refetch({}, { useCache: true })).resolves.toEqual(response)
      })

      await waitForNextUpdate()
    })
  })

  describe('when axios rejects', () => {
    it('should reject with the error by default', async () => {
      const error = new Error('boom')

      axios.mockRejectedValue(error)

      const {
        result: {
          current: [, refetch]
        },
        waitForNextUpdate
      } = renderHook(() => useAxios(''))

      act(() => {
        expect(refetch()).rejects.toEqual(error)
      })

      await waitForNextUpdate()
    })

    it('should reject with the error when using cache', async () => {
      const error = new Error('boom')

      axios.mockRejectedValue(error)

      const {
        result: {
          current: [, refetch]
        },
        waitForNextUpdate
      } = renderHook(() => useAxios(''))

      act(() => {
        expect(refetch({}, { useCache: true })).rejects.toEqual(error)
      })

      await waitForNextUpdate()
    })
  })
})

it('should return the same reference to the fetch function', async () => {
  axios.mockResolvedValue({ data: 'whatever' })

  const { result, rerender, waitForNextUpdate } = renderHook(() => useAxios(''))

  const firstRefetch = result.current[1]

  rerender()

  expect(result.current[1]).toBe(firstRefetch)

  await waitForNextUpdate()
})

describe('manual option', () => {
  it('should set loading to false', async () => {
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
    axios.mockResolvedValueOnce({ data: 'whatever' })

    const { waitForNextUpdate } = renderHook(() => useAxios(''))

    await waitForNextUpdate()

    expect(axios).toHaveBeenCalledTimes(1)
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({ adapter: expect.any(Function) })
    )
  })

  it('should allow disabling cache', async () => {
    axios.mockResolvedValueOnce({ data: 'whatever' })

    const { waitForNextUpdate } = renderHook(() =>
      useAxios('', { useCache: false })
    )

    await waitForNextUpdate()

    expect(axios).toHaveBeenCalledTimes(1)
    expect(axios).toHaveBeenCalledWith(
      expect.not.objectContaining({ adapter: expect.any(Function) })
    )
  })
})

describe('configure', () => {
  afterEach(() => resetConfigure())

  it('should provide a custom implementation of axios', () => {
    const mockAxios = jest.fn().mockReturnValueOnce({ data: 'whatever' })

    mockCancelToken(mockAxios)

    configure({ axios: mockAxios })

    const { waitForNextUpdate } = renderHook(() => useAxios(''))

    expect(mockAxios).toHaveBeenCalled()

    return waitForNextUpdate()
  })
})
