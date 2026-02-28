/**
 * API 엔드포인트 및 URL 관리 유틸리티
 * 모든 API 리소스(/posts, /post, /content 등)에 대한 통합 관리
 */

// 기본 API URL 설정
const getBaseURL = (): string => {
    // 개발 환경에서는 Axios 인스턴스가 이미 /api baseURL을 가지므로 빈 문자열 반환
    if (import.meta.env.DEV) {
        return ''
    }
    // 배포 환경에서는 전체 API URL 사용
    return import.meta.env.VITE_API_BASE_URL || 'https://your-production-api.com'
}

/**
 * API 엔드포인트 상수 정의
 * 실제 백엔드에 구현된 엔드포인트만 포함
 */
export const API_ENDPOINTS = {
    // 게시글 관련
    POSTS: '/posts',           // 게시글 목록 (list_of_posts_posts_get)
    POST: '/post',            // 단일 게시글 (post_info_post_get)

    // 콘텐츠 관련
    CONTENT: '/content',      // 콘텐츠 (content_content_get)
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
 * 실제 백엔드 API 파라미터에 맞게 구성
 */
export const apiHelpers = {
    // 게시글 목록 - private_access 파라미터 지원
    getPosts: (params?: { private_access?: boolean }) =>
        buildApiURLWithParams(API_ENDPOINTS.POSTS, params || {}),

    // 단일 게시글 - post_id 파라미터 필요
    getPost: (postId: string) =>
        buildApiURLWithParams(API_ENDPOINTS.POST, { post_id: postId }),

    // 콘텐츠 - item_id 파라미터 필요
    getContent: (itemId: string) =>
        buildApiURLWithParams(API_ENDPOINTS.CONTENT, { item_id: itemId }),
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
        console.log('Available Endpoints:', Object.keys(API_ENDPOINTS))
        console.groupEnd()
    }
}

