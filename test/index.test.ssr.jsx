import axios from 'axios'
import React from 'react'
import ReactDOM from 'react-dom/server'

import useAxios, { __ssrPromises } from '../src'
import { mockCancelToken } from './testUtils'

jest.mock('axios')

beforeEach(() => {
  mockCancelToken(axios)
})

function DummyComponent(props) {
  useAxios('', props)

  return null
}

it('should not populate promises on server when manual', () => {
  ReactDOM.renderToString(<DummyComponent manual={true} />)

  expect(__ssrPromises.length).toBe(0)
})

it('should populate promises on server', () => {
  axios.mockResolvedValueOnce({ data: 'whatever' })

  ReactDOM.renderToString(<DummyComponent />)

  expect(__ssrPromises.length).toBe(1)
})
