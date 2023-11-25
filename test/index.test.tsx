import React from 'react'
import axios, { CanceledError } from 'axios'
import { render, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'

import defaultUseAxios, {
  configure as defaultConfigure,
  resetConfigure as defaultResetConfigure,
  clearCache as defaultClearCache,
  loadCache as defaultLoadCache,
  serializeCache as defaultSerializeCache,
  makeUseAxios
} from '../src'
import { LRUCache } from 'lru-cache'

jest.mock('axios', ()=>{
  const originalModule = jest.requireActual('axios')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => axios),
  };;
})
const mockedAxios = axios as jest.MockedFunction<typeof axios>

let errors
let abortSpy

beforeEach(() => {
  abortSpy = jest.spyOn(AbortController.prototype, 'abort')
})

beforeAll(() => {
  const error = console.error

  console.error = (...args) => {
    error.apply(console, args) // keep default behaviour
    errors.push(args)
  }
})

beforeEach(() => {
  errors = []
})

afterEach(() => {
  // assert that no errors were logged during tests
  expect(errors).toEqual([])
})

describe('default useAxios', () => {
  standardTests(
    defaultUseAxios,
    defaultConfigure,
    defaultResetConfigure,
    defaultClearCache,
    defaultLoadCache,
    defaultSerializeCache
  )
})

describe('makeUseAxios', () => {
  it('should be a function', () => {
    expect(makeUseAxios).toBeInstanceOf(Function)
  })

  it('should not throw', () => {
    expect(makeUseAxios()).toBeTruthy()
  })

  it('should provide a custom implementation of axios', () => {
    const mockAxios = jest.fn().mockResolvedValueOnce({ data: 'whatever' })

    const setup = makeSetup(makeUseAxios({ axios: mockAxios }))

    const { waitForNextUpdate } = setup('')

    expect(mockAxios).toHaveBeenCalled()

    return waitForNextUpdate()
  })

  describe('globally disabled cache', () => {
    let setup

    beforeEach(() => {
      setup = makeSetup(makeUseAxios({ cache: false }))
    })

    it('should use local state across rerenders', async () => {
      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      const { waitForNextUpdate, rerender } = setup('')

      await waitForNextUpdate()

      rerender()

      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('should hit network across component mounts', async () => {
      mockedAxios.mockResolvedValue({ data: 'whatever' })

      const { waitForNextUpdate, unmount } = setup('')

      await waitForNextUpdate()

      unmount()

      await setup('').waitForNextUpdate()

      expect(axios).toHaveBeenCalledTimes(2)
    })
  })

  describe('default hook options', () => {
    describe('manual', () => {
      it('should override default manual option', () => {
        const setup = makeSetup(
          makeUseAxios({ defaultOptions: { manual: true } })
        )

        setup('')

        expect(axios).not.toHaveBeenCalled()
      })
    })

    describe('useCache', () => {
      it('should override default useCache option', async () => {
        const setup = makeSetup(
          makeUseAxios({ defaultOptions: { useCache: false } })
        )

        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, unmount } = setup('')

        await waitForNextUpdate()

        unmount()

        await setup('').waitForNextUpdate()

        expect(axios).toHaveBeenCalledTimes(2)
      })
    })

    describe('ssr', () => {
      it('should be able to set ssr option', () => {
        makeSetup(makeUseAxios({ defaultOptions: { ssr: false } }))
      })
    })
  })

  describe('standard tests', () => {
    const useAxios = makeUseAxios()

    standardTests(
      useAxios,
      useAxios.configure,
      useAxios.resetConfigure,
      useAxios.clearCache,
      useAxios.loadCache,
      useAxios.serializeCache
    )

    describe('with custom configuration', () => {
      const useAxios = makeUseAxios({ axios })

      standardTests(
        useAxios,
        useAxios.configure,
        useAxios.resetConfigure,
        useAxios.clearCache,
        useAxios.loadCache,
        useAxios.serializeCache
      )
    })
  })
})

function makeSetup(useAxios) {
  return (config, options: any = undefined) =>
    renderHook(
      ({ config, options }) => {
        return useAxios(config, options)
      },
      {
        initialProps: { config, options }
      }
    )
}

function standardTests(
  useAxios,
  configure,
  resetConfigure,
  clearCache,
  loadCache,
  serializeCache
) {
  const setup = makeSetup(useAxios)

  beforeEach(clearCache)

  describe('basic functionality', () => {
    it('should set loading to true and error to null before the request resolves', async () => {
      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      const { result, waitForNextUpdate } = setup('')

      expect(result.current[0].loading).toBe(true)
      expect(result.current[0].error).toBe(null)

      await waitForNextUpdate()
    })

    it('should set loading to false when request resolves', async () => {
      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      const { result, waitForNextUpdate } = setup('')

      await waitForNextUpdate()

      expect(result.current[0].loading).toBe(false)
      expect(result.current[0].error).toBe(null)
      expect(result.current[0].data).toBe('whatever')
    })

    it('should set the response', async () => {
      const response = { data: 'whatever' }

      mockedAxios.mockResolvedValueOnce(response)

      const { result, waitForNextUpdate } = setup('')

      await waitForNextUpdate()

      expect(result.current[0].loading).toBe(false)
      expect(result.current[0].error).toBe(null)
      expect(result.current[0].response).toBe(response)
    })

    it('should set error when request fails', async () => {
      const error = new Error('boom')

      mockedAxios.mockRejectedValueOnce(error)

      const { result, waitForNextUpdate } = setup('')

      await waitForNextUpdate()

      expect(result.current[0].error.message).toBe(error.message)
    })

    it('should not reset error when component rerenders', async () => {
      const error = new Error('boom')

      mockedAxios.mockRejectedValueOnce(error)

      const { result, waitForNextUpdate, rerender } = setup('')

      await waitForNextUpdate()

      expect(result.current[0].error.message).toBe(error.message)

      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      rerender()

      expect(result.current[0].error.message).toBe(error.message)
    })

    it('should reset error when component remounts', async () => {
      const error = new Error('boom')

      mockedAxios.mockRejectedValueOnce(error)

      const firstRender = setup('')

      await firstRender.waitForNextUpdate()

      expect(firstRender.result.current[0].error.message).toBe(error.message)

      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      const secondRender = setup('')

      await secondRender.waitForNextUpdate()

      expect(secondRender.result.current[0].error).toBe(null)
    })

    it('should reset error when refetch succeeds', async () => {
      const error = new Error('boom')

      mockedAxios.mockRejectedValueOnce(error)

      const { result, waitForNextUpdate } = setup('')

      await waitForNextUpdate()

      expect(result.current[0].error.message).toBe(error.message)

      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      // Refetch
      act(() => {
        result.current[1]()
      })

      await waitForNextUpdate()

      expect(result.current[0].error).toBe(null)
    })

    it('should set loading to false when request completes and returns error', async () => {
      const error = new Error('boom')

      mockedAxios.mockRejectedValueOnce(error)

      const { result, waitForNextUpdate } = setup('')

      await waitForNextUpdate()

      expect(result.current[0].loading).toBe(false)
      expect(result.current[0].error.message).toBe(error.message)
    })

    it('should refetch', async () => {
      mockedAxios.mockResolvedValue({ data: 'whatever' })

      const { result, waitForNextUpdate } = setup('')

      await waitForNextUpdate()

      act(() => {
        result.current[1]()
      })

      expect(result.current[0].loading).toBe(true)
      expect(axios).toHaveBeenCalledTimes(2)

      await waitForNextUpdate()
    })

    it('should return the same reference to the fetch function', async () => {
      mockedAxios.mockResolvedValue({ data: 'whatever' })

      const { result, rerender, waitForNextUpdate } = setup('')

      const firstRefetch = result.current[1]

      rerender()

      expect(result.current[1]).toBe(firstRefetch)

      await waitForNextUpdate()
    })

    it('should return the cached response on a new render', async () => {
      const response = { data: 'whatever' }

      mockedAxios.mockResolvedValueOnce(response)

      await setup('').waitForNextUpdate()

      const { result } = setup('')

      expect(result.current[0]).toEqual({
        loading: false,
        error: null,
        data: response.data,
        response
      })
    })
  })

  describe('request cancellation', () => {
    describe('effect-generated requests', () => {
      it('should skip default cancellation before request if options.autoCancel is set to false', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, rerender } = setup('', {
          autoCancel: false
        })

        await waitForNextUpdate()

        rerender()

        expect(abortSpy).not.toHaveBeenCalled()
      })

      it('should skip default cancellation after unmount if options.autoCancel is set to false', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, unmount } = setup('', {
          autoCancel: false
        })

        await waitForNextUpdate()

        unmount()

        expect(abortSpy).not.toHaveBeenCalled()
      })

      it('should provide the abort signal to axios', async () => {
        mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

        const { waitForNextUpdate } = setup('')

        expect(axios).toHaveBeenCalledWith(
          expect.objectContaining({
            signal: expect.any(AbortSignal)
          })
        )

        await waitForNextUpdate()
      })

      it('should cancel the outstanding request when the component unmounts', async () => {
        mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

        const { waitForNextUpdate, unmount } = setup('')

        await waitForNextUpdate()

        unmount()

        expect(abortSpy).toHaveBeenCalled()
      })

      it('should cancel the outstanding request when the cancel method is called', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, result } = setup('')

        await waitForNextUpdate()

        result.current[2]()

        expect(abortSpy).toHaveBeenCalled()
      })

      it('should cancel the outstanding request when the component refetches due to a rerender', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, rerender } = setup('initial config')

        await waitForNextUpdate()

        rerender({ config: 'new config', options: {} })

        expect(abortSpy).toHaveBeenCalled()

        await waitForNextUpdate()
      })

      it('should not cancel the outstanding request when the component rerenders with same string config', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, rerender } = setup('initial config')

        await waitForNextUpdate()

        rerender()

        expect(abortSpy).not.toHaveBeenCalled()
      })

      it('should not cancel the outstanding request when the component rerenders with same object config', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, rerender } = setup({ some: 'config' })

        await waitForNextUpdate()

        rerender()

        expect(abortSpy).not.toHaveBeenCalled()
      })

      it('should not cancel the outstanding request when the component rerenders with equal string config', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, rerender } = setup('initial config', {})

        await waitForNextUpdate()

        rerender({ config: 'initial config', options: {} })

        expect(abortSpy).not.toHaveBeenCalled()
      })

      it('should not cancel the outstanding request when the component rerenders with equal object config', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, rerender } = setup({ some: 'config' }, {})

        await waitForNextUpdate()

        rerender({ config: { some: 'config' }, options: {} })

        expect(abortSpy).not.toHaveBeenCalled()
      })

      it('should cancel the outstanding request when the cancel method is called after the component rerenders with same config', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, rerender, result } = setup('initial config')

        await waitForNextUpdate()

        rerender()

        result.current[2]()

        expect(abortSpy).toHaveBeenCalled()
      })

      it('should not dispatch an error when the request is canceled', async () => {
        const cancellation = new CanceledError('canceled')

        mockedAxios.mockRejectedValueOnce(cancellation)

        const { result, waitFor } = setup('')

        // if we cancel we won't dispatch the error, hence there's no state update
        // to wait for. yet, if we don't try to wait, we won't know if we're handling
        // the error properly because the return value will not have the error until a
        // state update happens. it would be great to have a better way to test this
        await act(async () => {
          await waitFor(() => {
            expect(result.current[0].error).toBeNull()
          })
        })
      })
    })

    describe('manual refetches', () => {
      it('should provide the abort signal to axios', async () => {
        const { result, waitForNextUpdate } = setup('', { manual: true })

        mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

        act(() => {
          result.current[1]()
        })

        expect(axios).toHaveBeenCalledTimes(1)

        expect(axios).toHaveBeenLastCalledWith(
          expect.objectContaining({
            signal: expect.any(AbortSignal)
          })
        )

        await waitForNextUpdate()
      })

      it('should cancel the outstanding manual refetch when the component unmounts', async () => {
        const { result, waitForNextUpdate, unmount } = setup('', {
          manual: true
        })

        mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

        act(() => {
          result.current[1]()
        })

        await waitForNextUpdate()

        unmount()

        expect(abortSpy).toHaveBeenCalled()
      })

      it('should cancel the outstanding manual refetch when the component refetches', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { result, waitForNextUpdate, rerender } = setup('')

        act(() => {
          result.current[1]()
        })

        await waitForNextUpdate()

        rerender({ config: 'new config', options: {} })

        expect(abortSpy).toHaveBeenCalled()

        await waitForNextUpdate()
      })

      it('should cancel the outstanding manual refetch when the cancel method is called', async () => {
        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { result, waitForNextUpdate } = setup('', { manual: true })

        act(() => {
          result.current[1]()
        })

        await waitForNextUpdate()

        result.current[2]()

        expect(abortSpy).toHaveBeenCalled()
      })

      it('should throw an error when the request is canceled', async () => {
        const cancellation = new CanceledError('canceled')

        mockedAxios.mockRejectedValueOnce(cancellation)

        const { result } = renderHook(() => useAxios('', { manual: true }))

        expect(() => act(result.current[1])).rejects.toBe(cancellation)
      })

      it('should return response from cache in hook results', async () => {
        const response = { data: 'whatever' }

        mockedAxios.mockResolvedValueOnce(response)

        // first component renders and stores results in cache
        await setup('').waitForNextUpdate()

        const { result } = setup('', { manual: true })

        // no results on first render as it's a manual request
        expect(result.current[0]).toEqual({ loading: false, error: null })

        // refetch using cache
        act(() => {
          result.current[1]({}, { useCache: true })
        })

        expect(result.current[0]).toEqual({
          loading: false,
          error: null,
          response,
          data: response.data
        })
      })
    })
  })

  describe('refetch', () => {
    describe('when axios resolves', () => {
      it('should resolve to the response by default', async () => {
        const response = { data: 'whatever' }

        mockedAxios.mockResolvedValue(response)

        const {
          result: {
            current: [, refetch]
          },
          waitForNextUpdate
        } = setup('')

        act(() => {
          expect(refetch()).resolves.toEqual(response)
        })

        await waitForNextUpdate()

        expect(axios).toHaveBeenCalledTimes(2)
      })

      it('should resolve to the response when using cache', async () => {
        const response = { data: 'whatever' }

        mockedAxios.mockResolvedValue(response)

        const {
          result: {
            current: [, refetch]
          },
          waitForNextUpdate
        } = setup('')

        await waitForNextUpdate()

        act(() => {
          expect(refetch({}, { useCache: true })).resolves.toEqual(response)
        })

        expect(axios).toHaveBeenCalledTimes(1)
      })
    })

    describe('when axios rejects', () => {
      it('should reject with the error by default', async () => {
        const error = new Error('boom')

        mockedAxios.mockRejectedValue(error)

        const {
          result: {
            current: [, refetch]
          },
          waitForNextUpdate
        } = setup('')

        await waitForNextUpdate()

        act(() => {
          expect(refetch()).rejects.toEqual(error)
        })

        await waitForNextUpdate()
      })

      it('should reject with the error and skip cache even when using cache', async () => {
        const error = new Error('boom')

        mockedAxios.mockRejectedValue(error)

        const {
          result: {
            current: [, refetch]
          },
          waitForNextUpdate
        } = setup('')

        await waitForNextUpdate()

        act(() => {
          expect(refetch({}, { useCache: true })).rejects.toEqual(error)
        })

        await waitForNextUpdate()
      })
    })

    describe('configuration override handling', () => {
      it('should override url', async () => {
        const response = { data: 'whatever' }

        mockedAxios.mockResolvedValue(response)

        const {
          result: {
            current: [, refetch]
          },
          waitForNextUpdate
        } = setup('some url')

        act(() => {
          expect(refetch('some other url')).resolves.toEqual(response)
        })

        await waitForNextUpdate()

        expect(axios).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ url: 'some url' })
        )
        expect(axios).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({ url: 'some other url' })
        )
      })

      it('should merge with the existing configuration', async () => {
        const response = { data: 'whatever' }

        mockedAxios.mockResolvedValue(response)

        const {
          result: {
            current: [, refetch]
          },
          waitForNextUpdate
        } = setup('some url')

        act(() => {
          expect(refetch({ params: { some: 'param' } })).resolves.toEqual(
            response
          )
        })

        await waitForNextUpdate()

        expect(axios).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ url: 'some url' })
        )
        expect(axios).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            url: 'some url',
            params: { some: 'param' }
          })
        )
      })

      it('should ignore config override if it is an event', async () => {
        const response = { data: 'whatever' }

        mockedAxios.mockResolvedValue(response)

        const {
          result: {
            current: [, refetch]
          },
          waitForNextUpdate
        } = setup('some url')

        const handleClick = jest.fn(e => e.persist())

        fireEvent.click(
          render(<button onClick={handleClick} />).getByRole('button')
        )

        const [[clickEvent]] = handleClick.mock.calls

        act(() => {
          expect(refetch(clickEvent)).resolves.toEqual(response)
        })

        await waitForNextUpdate()

        expect(axios).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ url: 'some url' })
        )
        expect(axios).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({ url: 'some url' })
        )
      })
    })
  })

  describe('manual option', () => {
    it('should set loading to false on initial render', async () => {
      const { result } = setup('', { manual: true })

      expect(result.current[0].loading).toBe(false)
    })

    it('should not execute request immediately', () => {
      setup('', { manual: true })

      expect(axios).not.toHaveBeenCalled()
    })

    it('should execute request manually and skip cache by default', async () => {
      const { result, waitForNextUpdate } = setup('', { manual: true })

      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      act(() => {
        result.current[1]()
      })

      expect(result.current[0].loading).toBe(true)

      await waitForNextUpdate()

      expect(result.current[0].loading).toBe(false)
      expect(result.current[0].data).toBe('whatever')

      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('should allow using the cache', async () => {
      const { result, waitForNextUpdate } = setup('', { manual: true })

      const response = { data: 'whatever' }
      mockedAxios.mockResolvedValueOnce(response)

      // first manual request
      act(() => {
        result.current[1]()
      })

      await waitForNextUpdate()

      // cache hit
      act(() => {
        result.current[1]({}, { useCache: true })
      })

      expect(result.current[0]).toEqual({
        loading: false,
        error: null,
        response,
        data: response.data
      })

      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('should not return response even if there is a cached one', async () => {
      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      await setup('').waitForNextUpdate()

      const { result } = setup('', { manual: true })

      expect(result.current[0]).toEqual({ loading: false, error: null })
    })
  })

  describe('useCache option', () => {
    it('should use local state across rerenders', async () => {
      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      const { waitForNextUpdate, rerender } = setup('')

      await waitForNextUpdate()

      rerender()

      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('should not hit network across component mounts by default', async () => {
      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      const { waitForNextUpdate, unmount } = setup('')

      await waitForNextUpdate()

      unmount()

      setup('')

      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('should use local state across rerenders even when cache disabled', async () => {
      mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

      const { waitForNextUpdate, rerender } = setup('', { useCache: false })

      await waitForNextUpdate()

      rerender()

      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('should hit network across component mounts when cache disabled', async () => {
      mockedAxios.mockResolvedValue({ data: 'whatever' })

      const { waitForNextUpdate, unmount } = setup('', { useCache: false })

      await waitForNextUpdate()

      unmount()

      await setup('', { useCache: false }).waitForNextUpdate()

      expect(axios).toHaveBeenCalledTimes(2)
    })

    it('should store result in cache even when disabled', async () => {
      mockedAxios.mockResolvedValue({ data: 'whatever' })

      const { waitForNextUpdate, unmount } = setup('', { useCache: false })

      await waitForNextUpdate()

      unmount()

      setup('')

      expect(axios).toHaveBeenCalledTimes(1)
    })
  })

  describe('option change detection', () => {
    it('manual:false to manual:true with cache disabled should execute first request only', async () => {
      mockedAxios.mockResolvedValue({ data: 'whatever' })

      const { waitForNextUpdate, rerender } = setup('', {
        manual: false,
        useCache: false
      })

      await waitForNextUpdate()

      rerender({ config: '', options: { manual: true } })

      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('manual:true to manual:false with cache disabled should execute second request only', async () => {
      mockedAxios.mockResolvedValue({ data: 'whatever' })

      const { waitForNextUpdate, rerender } = setup('', {
        manual: true,
        useCache: false
      })

      rerender({ config: '', options: { manual: false } })

      await waitForNextUpdate()

      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('useCache:true to useCache:false should execute both requests', async () => {
      mockedAxios.mockResolvedValue({ data: 'whatever' })

      const { waitForNextUpdate, rerender } = setup('', {
        useCache: true
      })

      await waitForNextUpdate()

      rerender({ config: '', options: { useCache: false } })

      await waitForNextUpdate()

      expect(axios).toHaveBeenCalledTimes(2)
    })

    it('useCache:false to useCache:true should execute first request only', async () => {
      mockedAxios.mockResolvedValue({ data: 'whatever' })

      const { waitForNextUpdate, rerender } = setup('', {
        useCache: false
      })

      await waitForNextUpdate()

      rerender({ config: '', options: { useCache: true } })

      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('should reset error when one successful request follows a failing request', async () => {
      mockedAxios.mockResolvedValueOnce({ data: 'working 1' })

      const { result, waitForNextUpdate, rerender } = setup('working')

      await waitForNextUpdate()

      const error = new Error('boom')

      mockedAxios.mockRejectedValueOnce(error)

      rerender({ config: 'boom', options: {} })

      await waitForNextUpdate()

      expect(result.current[0].error.message).toBe(error.message)

      mockedAxios.mockResolvedValueOnce({ data: 'working 2' })

      rerender({ config: 'working', options: {} })

      expect(result.current[0].error).toBe(null)
      // because it's coming from cache
      expect(result.current[0].data).toBe('working 1')
    })
  })

  describe('configure', () => {
    afterEach(() => resetConfigure())

    it('should provide a custom implementation of axios', () => {
      const mockAxios = jest.fn().mockReturnValueOnce({ data: 'whatever' })

      configure({ axios: mockAxios })

      const { waitForNextUpdate } = setup('')

      expect(mockAxios).toHaveBeenCalled()

      return waitForNextUpdate()
    })

    describe('with globally disabled cache', () => {
      it('should use local state across rerenders', async () => {
        configure({ cache: false })

        mockedAxios.mockResolvedValueOnce({ data: 'whatever' })

        const { waitForNextUpdate, rerender } = setup('')

        await waitForNextUpdate()

        rerender()

        expect(axios).toHaveBeenCalledTimes(1)
      })

      it('should hit network across component mounts', async () => {
        configure({ cache: false })

        mockedAxios.mockResolvedValue({ data: 'whatever' })

        const { waitForNextUpdate, unmount } = setup('')

        await waitForNextUpdate()

        unmount()

        await setup('').waitForNextUpdate()

        expect(axios).toHaveBeenCalledTimes(2)
      })
    })

    describe('default hook options', () => {
      describe('manual', () => {
        it('should override default manual option', () => {
          configure({ defaultOptions: { manual: true } })

          setup('')

          expect(axios).not.toHaveBeenCalled()
        })
      })

      describe('useCache', () => {
        it('should override default useCache option', async () => {
          configure({ defaultOptions: { useCache: false } })

          mockedAxios.mockResolvedValue({ data: 'whatever' })

          const { waitForNextUpdate, unmount } = setup('')

          await waitForNextUpdate()

          unmount()

          await setup('').waitForNextUpdate()

          expect(axios).toHaveBeenCalledTimes(2)
        })
      })

      describe('ssr', () => {
        it('should be able to set ssr option', () => {
          configure({ defaultOptions: { ssr: false } })
        })
      })
    })
  })

  describe('loadCache', () => {
    it('should load cache', () => {
      const cache = new LRUCache({ max: 1 })

      loadCache(cache.dump())
    })
  })

  describe('serializeCache', () => {
    it('should serialize cache', async () => {
      await serializeCache()
    })
  })
}
