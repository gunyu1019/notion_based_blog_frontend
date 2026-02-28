/**
 * API 연결 상태를 확인하는 유틸리티
 */

import { blogApi } from '@/api'

/**
 * API 연결 상태를 테스트합니다.
 * @returns Promise<boolean> - 연결 성공 여부
 */
export const testApiConnection = async (): Promise<boolean> => {
    try {
        // 실제 API 엔드포인트에 따라 수정해야 할 수 있습니다
        await blogApi.defaultApiPostsGet()
        console.log('✅ API 연결 성공')
        return true
    } catch (error) {
        console.error('❌ API 연결 실패:', error)
        return false
    }
}

/**
 * 현재 API 설정 정보를 출력합니다.
 */
export const logApiConfig = (): void => {
    console.group('📊 API 설정 정보')
    console.log('환경:', import.meta.env.MODE)
    console.log('개발 모드:', import.meta.env.DEV)
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
    console.log('API Target:', import.meta.env.VITE_API_TARGET)
    console.groupEnd()
}
