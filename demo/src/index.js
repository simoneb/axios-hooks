import React from 'react'
import { render } from 'react-dom'

import useAxios from '../../src'

function AxiosHooksDemo() {
  const [{ data, loading, error }, reload] = useAxios(
    'https://jsonplaceholder.typicode.com/todos/1'
  )

  return (
    <div>
      <h1>axios-hooks demo</h1>
      <button onClick={reload}>Reload data</button>
      <div>
        {loading && 'Loading...'}
        {error && 'Error!!!'}
        <pre>{data && JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}

render(<AxiosHooksDemo />, document.querySelector('#demo'))
