import { expectAssignable, expectType } from 'tsd'
import { AxiosError, AxiosResponse } from 'axios'

import useAxios from '../src'

useAxios('')
useAxios(
  { url: '' },
  { autoCancel: true, manual: true, ssr: true, useCache: true }
)

const [{ data, loading, error, response }, refetch, cancel] = useAxios('')

expectType<any>(data)
expectType<boolean>(loading)
expectAssignable<AxiosError<any, any> | null>(error)
expectAssignable<AxiosResponse | undefined>(response)
expectAssignable<Function>(refetch)
expectAssignable<Function>(cancel)

refetch('')
refetch({ url: '' }, { useCache: true })
refetch(new MouseEvent('click'))
cancel()
