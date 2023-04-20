// 取消请求-new abortController
import qs from 'qs'
import { CancelAxiosConfig } from '../interface'
// * 序列化参数
const getPendingUrl = (config: CancelAxiosConfig): string => {
  const { method, url, data, params } = config
  return [method, url, qs.stringify(data), qs.stringify(params)].join('&')
}

export const httpList: Array<CancelAxiosConfig> = []

export const cancelHttp = (config: CancelAxiosConfig): void => {
  const requestKey: string = getPendingUrl(config)
  let repeatIndex: number = httpList.findIndex((tempRequestConfig) => {
    const tempRequstKeyKey: string = getPendingUrl(tempRequestConfig)
    return requestKey === tempRequstKeyKey
  })
  if (repeatIndex >= 0) {
    httpList[repeatIndex]?.controller?.abort()
    httpList.splice(repeatIndex, 1)
  }
  httpList.push(config)
}
