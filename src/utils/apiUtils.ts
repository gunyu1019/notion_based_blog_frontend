/**
 * API 엔드포인트 및 URL 관리 유틸리티
 * 모든 API 리소스(/posts, /post, /content 등)에 대한 통합 관리
 */

// 기본 API URL 설정
const getBaseURL = (): string => {
    if (import.meta.env.DEV) {
        return '/api'
    }
    return import.meta.env.VITE_API_BASE_URL || 'https://your-production-api.com'
}

// WebSocket URL 설정
export const getWebSocketURL = (): string => {
    if (import.meta.env.DEV) {
        return '/ws'
    }
    return import.meta.env.VITE_WS_BASE_URL || 'wss://your-production-api.com/ws'
}

// 정적 파일 URL 설정
export const getStaticURL = (path: string): string => {
    const baseStaticURL = import.meta.env.DEV
        ? '/static'
        : (import.meta.env.VITE_STATIC_BASE_URL || 'https://your-production-api.com/static')
    return `${baseStaticURL}${path.startsWith('/') ? path : '/' + path}`
}

// 미디어 파일 URL 설정
export const getMediaURL = (path: string): string => {
    const baseMediaURL = import.meta.env.DEV
        ? '/media'
        : (import.meta.env.VITE_MEDIA_BASE_URL || 'https://your-production-api.com/media')
    return `${baseMediaURL}${path.startsWith('/') ? path : '/' + path}`
}

/**
 * API 엔드포인트 상수 정의
 */
export const API_ENDPOINTS = {
    // 게시글 관련
    POSTS: '/posts',           // 게시글 목록
    POST: '/post',            // 단일 게시글
    POST_DETAIL: (id: string | number) => `/post/${id}`,  // 게시글 상세

    // 콘텐츠 관련
    CONTENT: '/content',      // 콘텐츠 목록
    CONTENT_DETAIL: (id: string | number) => `/content/${id}`,  // 콘텐츠 상세

    // 카테고리 관련
    CATEGORIES: '/categories', // 카테고리 목록
    CATEGORY: (id: string | number) => `/category/${id}`,  // 특정 카테고리

    // 태그 관련
    TAGS: '/tags',            // 태그 목록
    TAG: (id: string | number) => `/tag/${id}`,           // 특정 태그

    // 검색 관련
    SEARCH: '/search',        // 검색
    SEARCH_POSTS: '/search/posts',      // 게시글 검색
    SEARCH_CONTENT: '/search/content',  // 콘텐츠 검색

    // 통계 관련
    STATS: '/stats',          // 전체 통계
    STATS_POPULAR: '/stats/popular',    // 인기 게시글
    STATS_RECENT: '/stats/recent',      // 최근 게시글

    // 사용자 관련 (필요시)
    USER: '/user',            // 사용자 정보
    AUTH: '/auth',            // 인증

    // 파일 업로드
    UPLOAD: '/upload',        // 파일 업로드
    UPLOAD_IMAGE: '/upload/image',      // 이미지 업로드
} as const

/**
 * 완전한 API URL 생성 헬퍼 함수
 */
export const buildApiURL = (endpoint: string): string => {
    const baseURL = getBaseURL()
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint
    return `${baseURL}${normalizedEndpoint}`
}

/**
 * 쿼리 파라미터를 포함한 API URL 생성
 */
export const buildApiURLWithParams = (
    endpoint: string,
    params: Record<string, string | number | boolean | null | undefined>
): string => {
    const baseURL = buildApiURL(endpoint)
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.append(key, String(value))
        }
    })

    const queryString = searchParams.toString()
    return queryString ? `${baseURL}?${queryString}` : baseURL
}

/**
 * API 요청 헬퍼 함수들
 */
export const apiHelpers = {
    // 게시글 관련
    getPosts: (params?: { category?: string; tag?: string; limit?: number; offset?: number }) =>
        buildApiURLWithParams(API_ENDPOINTS.POSTS, params || {}),

    getPost: (id: string | number) => buildApiURL(API_ENDPOINTS.POST_DETAIL(id)),

    // 콘텐츠 관련
    getContent: (params?: { type?: string; limit?: number; offset?: number }) =>
        buildApiURLWithParams(API_ENDPOINTS.CONTENT, params || {}),

    getContentDetail: (id: string | number) => buildApiURL(API_ENDPOINTS.CONTENT_DETAIL(id)),

    // 카테고리 관련
    getCategories: () => buildApiURL(API_ENDPOINTS.CATEGORIES),
    getCategory: (id: string | number) => buildApiURL(API_ENDPOINTS.CATEGORY(id)),

    // 검색 관련
    searchPosts: (query: string, params?: { limit?: number; offset?: number }) =>
        buildApiURLWithParams(API_ENDPOINTS.SEARCH_POSTS, { q: query, ...params }),

    searchContent: (query: string, params?: { limit?: number; offset?: number }) =>
        buildApiURLWithParams(API_ENDPOINTS.SEARCH_CONTENT, { q: query, ...params }),
}

/**
 * 디버그 정보 출력
 */
export const logApiConfig = (): void => {
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.group('🔧 API 설정 정보')
        console.log('환경:', import.meta.env.MODE)
        console.log('개발 모드:', import.meta.env.DEV)
        console.log('API Base URL:', getBaseURL())
        console.log('WebSocket URL:', getWebSocketURL())
        console.log('Static URL:', getStaticURL('/'))
        console.log('Media URL:', getMediaURL('/'))
        console.log('Available Endpoints:', Object.keys(API_ENDPOINTS))
        console.groupEnd()
    }
}

// 기본 export
export default {
    getBaseURL,
    getWebSocketURL,
    getStaticURL,
    getMediaURL,
    buildApiURL,
    buildApiURLWithParams,
    API_ENDPOINTS,
    apiHelpers,
    logApiConfig
}
