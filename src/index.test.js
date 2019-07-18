import { renderHook, act } from '@testing-library/react-hooks'
import axios from 'axios'

import useAxios from './'

jest.mock('axios')

it('should set loading to true', async () => {
  const { result } = renderHook(() => useAxios())

  expect(result.current[0].loading).toBe(true)
})

it('should set loading to false when request completes and returns data', async () => {
  axios.mockResolvedValueOnce({ data: 'whatever' })

  const { result, waitForNextUpdate } = renderHook(() => useAxios())

  await waitForNextUpdate()

  expect(result.current[0].loading).toBe(false)
  expect(result.current[0].data).toBe('whatever')
})

it('should reset error when request completes and returns data', async () => {
  axios.mockResolvedValueOnce({ data: 'whatever' })

  const { result, waitForNextUpdate } = renderHook(() => useAxios())

  result.current[0].error = new Error()

  await waitForNextUpdate()

  // Refetch
  act(() => {
    result.current[1]()
  })

  expect(result.current[0].error).toBe(null)
})

it('should set loading to false when request completes and returns error', async () => {
  const error = new Error('boom')

  axios.mockRejectedValue(error)

  const { result, waitForNextUpdate } = renderHook(() => useAxios())

  await waitForNextUpdate()

  expect(result.current[0].loading).toBe(false)
  expect(result.current[0].error).toBe(error)
})

it('should refetch', async () => {
  axios.mockResolvedValue({ data: 'whatever' })

  const { result, waitForNextUpdate } = renderHook(() => useAxios())

  await waitForNextUpdate()

  act(() => {
    result.current[1]()
  })

  expect(result.current[0].loading).toBe(true)
  expect(axios).toHaveBeenCalledTimes(2)
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
