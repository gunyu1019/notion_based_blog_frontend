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
 * 확장된 API 클라이언트 - 모든 리소스 지원
 */
export class ExtendedApiClient {
    private axios: AxiosInstance

    constructor() {
        this.axios = axiosInstance
    }

    // 게시글 관련 API
    async getPosts(params?: { category?: string; tag?: string; limit?: number; offset?: number }) {
        const url = apiHelpers.getPosts(params)
        return this.axios.get(url)
    }

    async getPost(id: string | number) {
        const url = apiHelpers.getPost(id)
        return this.axios.get(url)
    }

    async createPost(data: any) {
        return this.axios.post(buildApiURL(API_ENDPOINTS.POST), data)
    }

    async updatePost(id: string | number, data: any) {
        return this.axios.put(buildApiURL(API_ENDPOINTS.POST_DETAIL(id)), data)
    }

    async deletePost(id: string | number) {
        return this.axios.delete(buildApiURL(API_ENDPOINTS.POST_DETAIL(id)))
    }

    // 콘텐츠 관련 API
    async getContent(params?: { type?: string; limit?: number; offset?: number }) {
        const url = apiHelpers.getContent(params)
        return this.axios.get(url)
    }

    async getContentDetail(id: string | number) {
        const url = apiHelpers.getContentDetail(id)
        return this.axios.get(url)
    }

    // 카테고리 관련 API
    async getCategories() {
        const url = apiHelpers.getCategories()
        return this.axios.get(url)
    }

    async getCategory(id: string | number) {
        const url = apiHelpers.getCategory(id)
        return this.axios.get(url)
    }

    // 검색 관련 API
    async searchPosts(query: string, params?: { limit?: number; offset?: number }) {
        const url = apiHelpers.searchPosts(query, params)
        return this.axios.get(url)
    }

    async searchContent(query: string, params?: { limit?: number; offset?: number }) {
        const url = apiHelpers.searchContent(query, params)
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
