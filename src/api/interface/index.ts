import { GenericAbortSignal, InternalAxiosRequestConfig } from 'axios'
export interface CancelAxiosConfig extends InternalAxiosRequestConfig {
  controller?: AbortController
  signal?: GenericAbortSignal
}

export interface Result {
  code: number
  msg: any
}

export interface ResultData<T = any> extends Result {
  data: T
}
