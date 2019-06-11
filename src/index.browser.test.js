import { renderHook, act } from 'react-hooks-testing-library'
import axios from 'axios'

import useAxios from './'

jest.mock('axios')

describe('browser tests', () => {
  test('should set loading to true', async () => {
    const { result } = renderHook(() => useAxios())

    expect(result.current[0].loading).toBe(true)
  })

  test('should set loading to false when request completes and return data', async () => {
    axios.mockResolvedValue({ data: 'whatever' })
    const { result, waitForNextUpdate } = renderHook(() => useAxios())

    await waitForNextUpdate()

    expect(result.current[0].loading).toBe(false)
    expect(result.current[0].data).toBe('whatever')
  })

  test('should set loading to false when request completes and return error', async () => {
    const error = new Error('boom')
    axios.mockRejectedValue(error)

    const { result, waitForNextUpdate } = renderHook(() => useAxios())

    await waitForNextUpdate()

    expect(result.current[0].loading).toBe(false)
    expect(result.current[0].error).toBe(error)
  })

  test('should refetch', async () => {
    axios.mockResolvedValue({ data: 'whatever' })
    const { result, waitForNextUpdate } = renderHook(() => useAxios())

    await waitForNextUpdate()

    act(() => {
      result.current[1]()
    })

    expect(result.current[0].loading).toBe(true)
  })

  describe('manual option', () => {
    test('should set loading to false', async () => {
      const { result } = renderHook(() => useAxios('', { manual: true }))

      expect(result.current[0].loading).toBe(false)
    })

    test('should execute request manually', async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useAxios('', { manual: true })
      )

      axios.mockResolvedValue({ data: 'whatever' })

      act(() => {
        result.current[1]()
      })

      expect(result.current[0].loading).toBe(true)

      await waitForNextUpdate()

      expect(result.current[0].loading).toBe(false)
      expect(result.current[0].data).toBe('whatever')
    })
  })
})
