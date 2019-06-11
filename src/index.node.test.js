/**
 * @jest-environment node
 */

import { renderHook } from 'react-hooks-testing-library'
import axios from 'axios'

import useAxios, { serializeCache } from './'

jest.mock('axios')

describe('node tests', () => {
  test('should populate promises on first render', async () => {
    axios
      .mockImplementationOnce(config => {
        expect(config.adapter).toBeInstanceOf(Function)
        return config.adapter(config)
      })
      .mockImplementationOnce(config => {
        expect(config.adapter).toBeUndefined()
        return Promise.resolve({ data: { hello: 'world' } })
      })

    renderHook(() => useAxios())

    const cache = await serializeCache()

    expect(cache.length).toEqual(1)
  })

  test('should populate initial state on second render', async () => {
    axios
      .mockImplementationOnce(config => {
        expect(config.adapter).toBeInstanceOf(Function)
        return config.adapter(config)
      })
      .mockImplementationOnce(config => {
        expect(config.adapter).toBeUndefined()
        return Promise.resolve({ data: { hello: 'world' } })
      })

    renderHook(() => useAxios({}))

    await serializeCache()

    const { result } = renderHook(() => useAxios({}))

    expect(result.current[0]).toEqual({
      loading: false,
      data: { hello: 'world' }
    })
  })
})
