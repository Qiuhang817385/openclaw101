import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import toast from 'react-hot-toast'

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message: string }>) => {
    const message =
      error.response?.data?.message || error.message || '请求失败，请稍后重试'

    toast.error(message)
    return Promise.reject(error)
  },
)

export default request
