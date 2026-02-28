import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { DefaultApi, Configuration } from './generated'
import {
    buildApiURL,
    buildApiURLWithParams,
    API_ENDPOINTS,
    apiHelpers,
    logApiConfig
} from '@/utils/apiUtils'

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
    timeout: 15000, // 타임아웃을 15초로 증가
    headers: {
        'Content-Type': 'application/json'
    }
})

// 요청 인터셉터 (필요시 토큰 추가 등)
axiosInstance.interceptors.request.use(
    (config) => {
        // 디버그 모드에서 요청 로그 출력
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
            console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.data)
        }

        // 여기서 인증 토큰 등을 추가할 수 있습니다
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config
    },
    (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

// 응답 인터셉터 (에러 처리)
axiosInstance.interceptors.response.use(
    (response) => {
        // 디버그 모드에서 응답 로그 출력
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
            console.log('✅ API Response:', response.status, response.config.url, response.data)
        }
        return response
    },
    (error) => {
        // 전역 에러 처리
        console.error('❌ API Error:', error.response?.status, error.response?.data || error.message)
        return Promise.reject(error)
    }
)

// API Configuration
const configuration = new Configuration({
    basePath: getBaseURL()
})

// Blog API 인스턴스 생성 (OpenAPI Generated)
export const blogApi = new DefaultApi(configuration, undefined, axiosInstance)

/**
 * 확장된 API 클라이언트 - 실제 구현된 리소스만 지원
 */
export class ExtendedApiClient {
    private axios: AxiosInstance

    constructor() {
        this.axios = axiosInstance
    }

    // 게시글 목록 API - private_access 파라미터 지원
    async getPosts(params?: { private_access?: boolean }) {
        const url = apiHelpers.getPosts(params)
        return this.axios.get(url)
    }

    // 단일 게시글 API - post_id 파라미터 필요
    async getPost(postId: string) {
        const url = apiHelpers.getPost(postId)
        return this.axios.get(url)
    }

    // 콘텐츠 API - item_id 파라미터 필요
    async getContent(itemId: string) {
        const url = apiHelpers.getContent(itemId)
        return this.axios.get(url)
    }

    // 범용 API 호출 메서드
    async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axios.request(config)
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axios.get(url, config)
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axios.post(url, data, config)
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axios.put(url, data, config)
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axios.delete(url, config)
    }
}

// 확장된 API 클라이언트 인스턴스
export const extendedApi = new ExtendedApiClient()

// 설정 정보 로그 출력 (개발 모드에서만)
if (import.meta.env.DEV) {
    logApiConfig()
}

// 유틸리티 함수들 re-export
export {
    buildApiURL,
    buildApiURLWithParams,
    API_ENDPOINTS,
    apiHelpers
}

// 타입들도 export
export * from './generated'
