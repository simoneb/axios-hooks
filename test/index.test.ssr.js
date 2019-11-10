import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'

import useAxios, { __ssrPromises } from '../src'
import { mockCancelToken } from './testUtils'

jest.mock('axios')

beforeEach(() => {
  mockCancelToken(axios)
})

it('should not populate promises on server when manual', () => {
  renderHook(() => useAxios('', { manual: true }))

  expect(__ssrPromises.length).toBe(0)
})
