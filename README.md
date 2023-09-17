> The license of this software has changed to AWISC - Anti War ISC license

# axios-hooks

![ci](https://github.com/simoneb/axios-hooks/workflows/ci/badge.svg)
[![codecov](https://codecov.io/gh/simoneb/axios-hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/simoneb/axios-hooks)
[![npm version](https://badge.fury.io/js/axios-hooks.svg)](https://badge.fury.io/js/axios-hooks)
[![bundlephobia](https://badgen.net/bundlephobia/minzip/axios-hooks)](https://bundlephobia.com/result?p=axios-hooks)

React hooks for [axios], with built-in support for server side rendering.

## Features

- All the [axios] awesomeness you are familiar with
- Zero configuration, but configurable if needed
- One-line usage
- Super straightforward to use with SSR

## Installation

`npm install axios axios-hooks`

> `axios` is a peer dependency and needs to be installed explicitly

## Version information

- `axios-hooks@5.x` is compatible with `axios@1.x`
- `axios-hooks@4.x` and below are compatible with `axios@0.x`

## Quick Start

[![Edit axios-hooks Quick Start](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/2oxrlq8rjr)

```js
import useAxios from 'axios-hooks'

function App() {
  const [{ data, loading, error }, refetch] = useAxios(
    'https://reqres.in/api/users?delay=1'
  )

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error!</p>

  return (
    <div>
      <button onClick={refetch}>refetch</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

## Documentation

### API

- [useAxios](#useaxiosurlconfig-options)
- [configure](#configure-cache-axios-defaultoptions-)
- [serializeCache](#serializeCache)
- [loadCache](#loadcachecache)
- [makeUseAxios](#makeuseaxios-cache-axios-defaultoptions-)

### Examples

- [Quick start](https://codesandbox.io/s/2oxrlq8rjr)
- [Manual request](https://codesandbox.io/s/axioshooks-manual-request-bq9w4)
- [Error handling](https://codesandbox.io/s/axios-hooks-error-handling-gvi41)
- [Authentication and token refresh](https://codesandbox.io/s/axios-hooks-authentication-zyeyh)
- [Caching](https://codesandbox.io/s/axios-hooks-caching-nm62v)
- [Using makeUseAxios](https://codesandbox.io/s/axios-hooks-makeuseaxios-kfuym)
- [Configuration](https://codesandbox.io/s/oqvxw6mpyq)
- [Pagination](https://codesandbox.io/s/axios-hooks-pagination-1wk3u)
- [Infinite scrolling](https://codesandbox.io/s/axios-hooks-infinite-scrolling-42nw6)
- [Request chaining](https://codesandbox.io/s/axios-hooks-request-chaining-wn12l)
- [Options change detection](https://codesandbox.io/s/axios-hooks-options-change-v23tl)
- [react-native](https://snack.expo.io/@simoneb/axios-hooks-react-native)
- [With react-sortable-hoc](https://codesandbox.io/s/axios-hooks-react-sortable-hoc-eo3oy)
- [With react-router](https://codesandbox.io/s/axios-hooks-react-router-26iwm)

### Guides

- [Refresh Behavior](#refresh-behavior)
- [Configuration](#configuration)
- [Manual Requests](#manual-requests)
- [Manual Cancellation](#manual-cancellation)
- [Server Side Rendering](#server-side-rendering)
- [Multiple Hook Instances](#multiple-hook-instances)

## API

The package exports one default export and named exports:

```js
import useAxios, {
  configure,
  loadCache,
  serializeCache,
  makeUseAxios
} from 'axios-hooks'
```

### useAxios(url|config, options)

The main React hook to execute HTTP requests.

- `url|config` - The request URL or [config](https://github.com/axios/axios#request-config) object, the same argument accepted by `axios`.
- `options` - An options object.
  - `manual` ( `false` ) - If true, the request is not executed immediately. Useful for non-GET requests that should not be executed when the component renders. Use the `execute` function returned when invoking the hook to execute the request manually.
  - `useCache` ( `true` ) - Allows caching to be enabled/disabled for the hook. It doesn't affect the `execute` function returned by the hook.
  - `ssr` ( `true` ) - Enables or disables SSR support
  - `autoCancel` ( `true` ) - Enables or disables automatic cancellation of pending requests whether it be
    from the automatic hook request or from the `manual` execute method

> [!IMPORTANT]  
> Default caching behavior can interfere with test isolation. Read the [testing](#testing) section for more information.

**Returns**

`[{ data, loading, error, response }, execute, manualCancel]`

- `data` - The [success response](https://github.com/axios/axios#response-schema) data property (for convenient access).
- `loading` - True if the request is in progress, otherwise False.
- `error` - The [error](https://github.com/axios/axios#handling-errors) value
- `response` - The whole [success response](https://github.com/axios/axios#response-schema) object.

- `execute([config[, options]])` - A function to execute the request manually, bypassing the cache by default.

  - `config` - Same `config` object as `axios`, which is _shallow-merged_ with the config object provided when invoking the hook. Useful to provide arguments to non-GET requests.
  - `options` - An options object.
    - `useCache` ( `false` ) - Allows caching to be enabled/disabled for this "execute" function.

  **Returns**

  A promise containing the response. If the request is unsuccessful, the promise reects and the rejection must be handled manually.

- `manualCancel()` - A function to cancel outstanding requests manually.

### configure({ cache, axios, defaultOptions })

Allows to provide custom instances of cache and axios and to override the default options.

- `cache` An instance of [lru-cache](https://github.com/isaacs/node-lru-cache), or `false` to disable the cache
- `axios` An instance of [axios](https://github.com/axios/axios#creating-an-instance)
- `defaultOptions` An object overriding the default Hook options. It will be merged with the default options.

### serializeCache()

Dumps the request-response cache, to use in server side rendering scenarios.

**Returns**

`Promise<Array>` A serializable representation of the request-response cache ready to be used by `loadCache`

### loadCache(cache)

Populates the cache with serialized data generated by `serializeCache`.

- `cache` The serializable representation of the request-response cache generated by `serializeCache`

### makeUseAxios({ cache, axios, defaultOptions })

Creates an instance of the `useAxios` hook configured with the supplied cache, axios instance and default options.

- `cache` An instance of [lru-cache](https://github.com/isaacs/node-lru-cache), or `false` to disable the cache
- `axios` An instance of [axios](https://github.com/axios/axios#creating-an-instance)
- `defaultOptions` An object overriding the default Hook options. It will be merged with the default options.

**Returns**

An instance of `useAxios` React Hook which will always use the provided cache and axios instance.

The returned value, besides being a function that can be used as a React Hook, also contains the properties:

- `resetConfigure`
- `configure`
- `loadCache`
- `serializeCache`

which are the same as the package's named exports but limited to the `useAxios` instance returned by `makeUseAxios`.

## Refresh Behavior

The arguments provided to `useAxios(config[,options])` are watched for changes and compared using deep object comparison.

When they change, if the configuration allows a request to be fired (e.g. `manual:false`), any pending request is canceled and a new request is triggered, to avoid automatic cancellation you should use `autoCancel:false` option

Because of this, it's important to make sure that the arguments to `useAxios` preserve deep equality across component renders. This is often the case unless functions (e.g. axios transformers) are provided to a configuration object. In that case, those functions need to be memoized or they will trigger a request execution at each render, leading to an infinite loop.

## Configuration

Unless provided via the `configure` function, `axios-hooks` uses as defaults:

- `axios` - the default `axios` package export
- `cache` - a new instance of the default `lru-cache` package export, with no arguments
- `defaultOptions` - `{ manual: false, useCache: true, ssr: true, autoCancel: true }`

These defaults may not suit your needs, for example:

- you may want a common base url for axios requests
- the default (Infinite) cache size may not be a sensible default
- you want to disable caching altogether

In such cases you can use the `configure` function to provide your custom implementation of both.

> When `configure` is used, it should be invoked once before any usages of the `useAxios` hook

### Example

[![Edit axios-hooks configuration example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/oqvxw6mpyq)

```js
import { configure } from 'axios-hooks'
import LRU from 'lru-cache'
import Axios from 'axios'

const axios = Axios.create({
  baseURL: 'https://reqres.in/api'
})

const cache = new LRU({ max: 10 })

configure({ axios, cache })
```

## Manual Requests

On the client, requests are executed when the component renders using a React `useEffect` hook.

This may be undesirable, as in the case of non-GET requests. By using the `manual` option you can skip the automatic execution of requests and use the return value of the hook to execute them manually, optionally providing configuration overrides to `axios`.

### Example

In the example below we use the `useAxios` hook twice. Once to load the data when the component renders, and once to submit data updates via a `PUT` request configured via the `manual` option.

[![Edit axios-hooks Manual Request](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/axioshooks-manual-request-bq9w4?fontsize=14)

```js
import useAxios from 'axios-hooks'

function App() {
  const [{ data: getData, loading: getLoading, error: getError }] = useAxios(
    'https://reqres.in/api/users/1'
  )

  const [{ data: putData, loading: putLoading, error: putError }, executePut] =
    useAxios(
      {
        url: 'https://reqres.in/api/users/1',
        method: 'PUT'
      },
      { manual: true }
    )

  function updateData() {
    executePut({
      data: {
        ...getData,
        updatedAt: new Date().toISOString()
      }
    })
  }

  if (getLoading || putLoading) return <p>Loading...</p>
  if (getError || putError) return <p>Error!</p>

  return (
    <div>
      <button onClick={updateData}>update data</button>
      <pre>{JSON.stringify(putData || getData, null, 2)}</pre>
    </div>
  )
}
```

## Manual Cancellation

The cancellation method can be used to cancel an outstanding request whether it be
from the automatic hook request or from the `manual` execute method.

### Example

In the example below we use the `useAxios` hook with its automatic and manual requests.
We can call the cancellation programmatically or via controls.

```js
function App() {
  const [pagination, setPagination] = useState({})
  const [{ data, loading }, refetch, cancelRequest] = useAxios({
    url: '/users?delay=5',
    params: { ...pagination }
  })

  const handleFetch = () => {
    setPagination({ per_page: 2, page: 2 })
  }

  const externalRefetch = async () => {
    try {
      await refetch()
    } catch (e) {
      // Handle cancellation
    }
  }

  return (
    <div>
      <button onClick={handleFetch}>refetch</button>
      <button onClick={externalRefetch}>External Refetch</button>
      <button disabled={!loading} onClick={cancelRequest}>
        Cancel Request
      </button>
      {loading && <p>...loading</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

## Server Side Rendering

`axios-hooks` seamlessly supports server side rendering scenarios, by preloading data on the server and providing the data to the client, so that the client doesn't need to reload it.

### How it works

1. the React component tree is rendered on the server
2. `useAxios` HTTP requests are executed on the server
3. the server code awaits `serializeCache()` in order to obtain a serializable representation of the request-response cache
4. the server injects a JSON-serialized version of the cache in a `window` global variable
5. the client hydrates the cache from the global variable before rendering the application using `loadCache`

### Example

[![Edit axios-hooks SSR example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/v83l3mjq57)

```html
<!-- fragment of the HTML template defining the window global variable -->

<script>
  window.__AXIOS_HOOKS_CACHE__ = {{{cache}}}
</script>
```

```js
// server code for the server side rendering handler

import { serializeCache } from 'axios-hooks'

router.use(async (req, res) => {
  const index = fs.readFileSync(`${publicFolder}/index.html`, 'utf8')
  const html = ReactDOM.renderToString(<App />)

  // wait for axios-hooks HTTP requests to complete
  const cache = await serializeCache()

  res.send(
    index
      .replace('{{{html}}}', html)
      .replace('{{{cache}}}', JSON.stringify(cache).replace(/</g, '\\u003c'))
  )
})
```

```js
// client side code for the application entry-point

import { loadCache } from 'axios-hooks'

loadCache(window.__AXIOS_HOOKS_CACHE__)

delete window.__AXIOS_HOOKS_CACHE__

ReactDOM.hydrate(<App />, document.getElementById('root'))
```

## Multiple Hook Instances

Sometimes it is necessary to communicate with different APIs or use different caching strategies for different HTTP interactions.

[`makeUseAxios`](#makeuseaxios-cache-axios) allows to create multiple instances of the `useAxios` React Hook which can be configured and managed independently.

In other words, `makeUseAxios` is a factory of `useAxios`, which returns a React Hook configured against the provided `axios` or `cache` instances.

> This feature can also be used to create a single pre configured React Hook instance as an alternative to the global `configure` feature

### Example

[![Edit axios-hooks makeUseAxios](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/axios-hooks-quick-start-kfuym)

```js
import axios from 'axios'
import { makeUseAxios } from 'axios-hooks'

const useAxios = makeUseAxios({
  axios: axios.create({ baseURL: 'https://reqres.in/api' })
})

function App() {
  const [{ data, loading, error }, refetch] = useAxios('/users?delay=1')

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error!</p>

  return (
    <div>
      <button onClick={refetch}>refetch</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

## Testing

Testing components that make use of the `useAxios` hook are susceptible to test isolation leakage because of default caching behavior. The following snippets can be used to disable caching while testing:

### react-testing-library

```js
beforeAll(() => {
  useAxios.configure({ cache: false })
})
```

## Promises

axios-hooks depends on a native ES6 Promise implementation to be [supported](http://caniuse.com/promises).
If your environment doesn't support ES6 Promises, you can [polyfill](https://github.com/jakearchibald/es6-promise).

## Credits

`axios-hooks` is heavily inspired by [graphql-hooks](https://github.com/nearform/graphql-hooks),
developed by the awesome people at [NearForm](https://github.com/nearform).

## License

MIT

[axios]: https://github.com/axios/axios
