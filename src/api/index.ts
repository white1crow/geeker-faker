import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ResultEnum } from '@/enums/httpEnum'
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/config/serviceLoading'
import { ElMessage } from 'element-plus'
import { checkStatus } from './helper/checkStatus'
import { cancelHttp } from './helper/cancelAxios'
import router from '@/routers'
import { LOGIN_URL } from '@/enums/config'
import { GlobalStore } from '@/stores'
import { CancelAxiosConfig, ResultData } from './interface'
const config = {
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: ResultEnum.TIMEOUT as number,
  withCredentials: true
}

class RequestHttp {
  service: AxiosInstance

  public constructor(config: AxiosRequestConfig) {
    this.service = axios.create(config)
    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的token,存储到vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: CancelAxiosConfig) => {
        const globalStore = GlobalStore()
        if (!config.headers!.noLoading) {
          const controller = new AbortController()
          config.controller = controller
          config.signal = controller.signal
          cancelHttp(config)
        } else {
          showFullScreenLoading()
        }
        const token = globalStore.token
        if (config.headers && typeof config.headers?.set === 'function')
          config.headers.set('x-access-token', token)
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response
        const globalStore = GlobalStore()
        // * 在请求结束后，并关闭请求 loading
        tryHideFullScreenLoading()
        // * 登陆失效（code == 401）
        if (data.code == ResultEnum.OVERDUE) {
          ElMessage.error(data.msg)
          globalStore.setToken('')
          router.replace(LOGIN_URL)
          return Promise.reject(data)
        }
        // * 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
        if (data.code && data.code !== ResultEnum.SUCCESS) {
          ElMessage.error(data.msg)
          return Promise.reject(data)
        }
        // * 成功请求（在页面上除非特殊情况，否则不用在页面处理失败逻辑）
        return data
      },
      async (error: AxiosError) => {
        const { response } = error
        if (error.code === 'ERR_CANCELED') {
          return Promise.reject('重复请求已取消')
        }
        tryHideFullScreenLoading()
        // 请求超时 && 网络错误单独判断，没有 response
        if (error.message.indexOf('timeout') !== -1) ElMessage.error('请求超时！请您稍后重试')
        if (error.message.indexOf('Network Error') !== -1) ElMessage.error('网络错误！请您稍后重试')
        // 根据响应的错误状态码，做不同的处理
        if (response) checkStatus(response.status)
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
        if (!window.navigator.onLine) router.replace('/500')
        return Promise.reject(error)
      }
    )
  }
  // * 常用请求方法封装
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.get(url, { params, ..._object })
  }
  post<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.post(url, params, _object)
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, _object)
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ..._object })
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ..._object, responseType: 'blob' })
  }
}

export default new RequestHttp(config)
