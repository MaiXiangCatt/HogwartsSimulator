import axios from 'axios'
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'
import { useUserStore } from '@/store/user';

// 定义 API 响应的统一格式
export interface BaseResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('jwtToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const { code, message, data } = response.data

    // 根据业务 code 判断是否成功，0 为成功
    if (response.config.responseType === 'blob') {
      return response
    }
    if (code !== 0) {
      toast.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
    return data
  },
  (error) => {
    // 处理 HTTP 网络错误
    let message = ''
    if (error.response) {
      const status = error.response.status
      const isLoginRequest = error.config.url?.includes('login')
      switch (status) {
        case 401:
          if (isLoginRequest) {
            message = '用户名或密码错误'
          } else {
            message = '身份验证过期，请重新登录'
            useUserStore.getState().logout()
            setTimeout(() => {
              window.location.href = '/'
            }, 1000)
          }
          break
        case 403:
          message = '没有权限访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = error.response.data?.message || '网络请求错误'
      }
    } else if (error.request) {
      message = '服务器未响应'
    } else {
      message = '请求配置错误'
    }

    toast.error(message)
    return Promise.reject(error)
  }
)

const request = {
  // 泛型 T：你期望返回的数据类型 (比如 RegisterResponse)
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return service.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  },
}

export default request
