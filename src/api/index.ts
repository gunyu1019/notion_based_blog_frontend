import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { DefaultApi, Configuration } from './generated'

// 개발/배포 환경에 따른 Base URL 설정
const getBaseURL = (): string => {
    // 개발 환경에서는 Vite proxy를 통해 /api 경로로 요청
    if (import.meta.env.DEV) {
        return '/api'
    }
    // 배포 환경에서는 환경변수 또는 기본값 사용
    return import.meta.env.VITE_API_BASE_URL || 'https://your-production-api.com'
}

// Axios 인스턴스 생성 및 설정
const axiosInstance: AxiosInstance = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 요청 인터셉터 (필요시 토큰 추가 등)
axiosInstance.interceptors.request.use(
    (config) => {
        // 여기서 인증 토큰 등을 추가할 수 있습니다
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 응답 인터셉터 (에러 처리)
axiosInstance.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // 전역 에러 처리
        console.error('API Error:', error)
        return Promise.reject(error)
    }
)

// API Configuration
const configuration = new Configuration({
    basePath: getBaseURL()
})

// Blog API 인스턴스 생성
export const blogApi = new DefaultApi(configuration, undefined, axiosInstance)

// 타입들도 export
export * from './generated'
