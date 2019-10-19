import { renderHook } from '@testing-library/react-hooks'

import useAxios, { __ssrPromises } from './'

jest.mock('axios')

it('should not populate promises on server when manual', () => {
  renderHook(() => useAxios('', { manual: true }))

  expect(__ssrPromises.length).toBe(0)
})
