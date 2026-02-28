/**
 * API 연결 상태를 확인하는 유틸리티
 * 실제 구현된 API 엔드포인트만 테스트
 */

import { extendedApi } from '@/api'
import { apiHelpers } from '@/utils/apiUtils'

/**
 * API 연결 상태를 테스트합니다.
 * @returns Promise<boolean> - 연결 성공 여부
 */
export const testApiConnection = async (): Promise<boolean> => {
    try {
        console.log('🔍 API 연결 테스트 시작...')

        // 게시글 목록 API 테스트 (실제 구현된 API 사용)
        await extendedApi.getPosts({ private_access: false })
        console.log('✅ /posts API 연결 성공')
        return true
    } catch (error) {
        console.error('❌ 기본 API 연결 실패:', error)
        return false
    }
}

/**
 * 프록시 설정 테스트
 */
export const testProxyConfiguration = async (): Promise<void> => {
    console.group('🔧 프록시 설정 테스트')

    try {
        // 실제 프록시 경로로 직접 요청
        const response = await fetch('/api/posts?private_access=false')

        if (response.ok) {
            console.log('✅ 프록시를 통한 직접 요청 성공:', response.status)
        } else {
            console.error('❌ 프록시 응답 오류:', response.status)
        }

    } catch (error) {
        console.error('❌ 프록시 설정 테스트 실패:', error)
    }

    console.groupEnd()
}

/**
 * 현재 API 설정 정보를 출력합니다.
 */
export const logCurrentApiConfig = (): void => {
    console.group('📊 현재 API 설정 정보')
    console.log('환경:', import.meta.env.MODE)
    console.log('개발 모드:', import.meta.env.DEV)
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
    console.log('API Target:', import.meta.env.VITE_API_TARGET)
    console.log('Debug 모드:', import.meta.env.VITE_DEBUG_MODE)
    console.groupEnd()
}

/**
 * URL 생성 검증 테스트
 */
export const testUrlGeneration = (): void => {
    console.group('🔍 URL 생성 검증 테스트')

    // API 헬퍼 함수들의 URL 생성 테스트
    console.log('Posts URL:', apiHelpers.getPosts({ private_access: false }))
    console.log('Post URL:', apiHelpers.getPost('test-id'))
    console.log('Content URL:', apiHelpers.getContent('test-item-id'))

    // 예상 결과 출력
    console.log('\n예상 결과:')
    console.log('- 개발 환경: /posts, /post?post_id=test-id, /content?item_id=test-item-id')
    console.log('- Axios가 /api를 앞에 붙여서: /api/posts, /api/post?post_id=test-id, /api/content?item_id=test-item-id')

    console.groupEnd()
}
