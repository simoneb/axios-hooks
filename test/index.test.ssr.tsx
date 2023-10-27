import axios from 'axios'
import React from 'react'
import ReactDOM from 'react-dom/server'

import { makeUseAxios } from '../src'
import { UseAxiosOptions } from '../src/types'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>;


let useAxios = makeUseAxios();

beforeEach(() => {
  useAxios = makeUseAxios()
})

function DummyComponent(props: UseAxiosOptions) {
  useAxios('', props)

  return null
}

it('should not populate promises on server when manual=true', () => {
  ReactDOM.renderToString(<DummyComponent manual={true} />)

  expect(useAxios.__ssrPromises.length).toBe(0)
})

it('should not populate promises on server when ssr=false', () => {
  ReactDOM.renderToString(<DummyComponent ssr={false} />)

  expect(useAxios.__ssrPromises.length).toBe(0)
})

it('should populate promises on server with default options', () => {
  mockedAxios.get.mockResolvedValueOnce({ data: 'whatever' })

  ReactDOM.renderToString(<DummyComponent />)

  expect(useAxios.__ssrPromises.length).toBe(1)
})
