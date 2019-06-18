import { renderHook, act } from 'react-hooks-testing-library'
import axios from 'axios'

import useAxios from './'

test('should set loading to true', async () => {
  const { result } = renderHook(() => useAxios())

  expect(result.current[0].loading).toBe(true)
})

test('should set loading to false when request completes and return data', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useAxios())

  act(() => {
    axios.resolvePromise({ data: 'whatever' })
  })

  await waitForNextUpdate()

  expect(result.current[0].loading).toBe(false)
  expect(result.current[0].data).toBe('whatever')
})

test('should set loading to false when request completes and return error', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useAxios())
  const error = new Error('boom')

  act(() => {
    axios.rejectPromise(error)
  })

  await waitForNextUpdate()

  expect(result.current[0].loading).toBe(false)
  expect(result.current[0].error).toBe(error)
})

test('should refetch', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useAxios())

  act(() => {
    axios.resolvePromise({ data: 'whatever' })
  })

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

    act(() => {
      result.current[1]()
    })

    expect(result.current[0].loading).toBe(true)

    act(() => {
      axios.resolvePromise({ data: 'whatever' })
    })

    await waitForNextUpdate()

    expect(result.current[0].loading).toBe(false)
    expect(result.current[0].data).toBe('whatever')
  })
})
