<template>
    <div class="async-image-block">
        <!-- 로딩 중 상태 -->
        <div v-if="isLoading" class="d-flex justify-content-center align-items-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">이미지를 불러오는 중...</span>
            </div>
            <span class="ms-2 text-muted">이미지를 불러오는 중...</span>
        </div>

        <!-- 에러 발생 상태 -->
        <div v-else-if="hasError" class="alert alert-light border text-muted text-center py-4">
            <i class="fas fa-exclamation-triangle text-warning me-2"></i>
            <span>이미지를 불러올 수 없습니다</span>
        </div>

        <!-- 이미지 렌더링 완료 -->
        <div v-else-if="imageUrl" class="image-container">
            <img
                :src="imageUrl"
                class="img-fluid w-100 rounded shadow-sm"
                alt="Blog Image"
                loading="lazy"
                @error="handleImageError"
                style="aspect-ratio: 16 / 9; object-fit: cover; width: 100%; height: auto"
            />

            <!-- 이미지 캡션 렌더링 (있는 경우) -->
            <div v-if="caption" class="image-caption text-muted mt-2 fs-6 text-center">
                {{ caption }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { blogApi } from '@/api'

interface Props {
    blockId: string
    caption?: string
}

const props = withDefaults(defineProps<Props>(), {
    caption: ''
})

// 상태 관리
const isLoading = ref<boolean>(true)
const imageUrl = ref<string | null>(null)
const hasError = ref<boolean>(false)

/**
 * 이미지 로드 에러 핸들러
 */
const handleImageError = () => {
    hasError.value = true
    isLoading.value = false
}

/**
 * Content API를 호출하여 실제 CDN URL 가져오기
 */
const loadImageUrl = async (): Promise<void> => {
    try {
        isLoading.value = true
        hasError.value = false

        // GET /content API 호출
        const response = await blogApi.contentContentGet(props.blockId)

        // 응답 검증 및 URL 추출
        if (response.data && response.data.length > 0 && response.data[0].url) {
            imageUrl.value = response.data[0].url
        } else {
            throw new Error('Invalid response: no URL found')
        }
    } catch (error) {
        console.error('Failed to load image URL:', error)
        hasError.value = true
    } finally {
        isLoading.value = false
    }
}

// 컴포넌트 마운트 시 이미지 URL 로딩
onMounted(() => {
    loadImageUrl()
})
</script>

<style scoped>
.async-image-block {
    width: 100%;
}

.image-container {
    width: 100%;
    margin: 1rem 0;
}

.image-caption {
    font-style: italic;
    font-size: 0.875rem;
    line-height: 1.4;
    margin-top: 0.5rem;
    word-wrap: break-word;
}

.spinner-border {
    width: 1.5rem;
    height: 1.5rem;
}

.alert {
    margin-bottom: 1rem;
}

img {
    transition: opacity 0.3s ease-in-out;
    display: block;
    margin: 0 auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
}

img:hover {
    opacity: 0.95;
}

/* 컬럼 내부에서의 이미지 스타일 강제 적용 */
.async-image-block img {
    max-width: 100% !important;
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 16 / 9 !important;
    object-fit: cover !important;
}

/* 정사각형 비율이 필요한 경우를 위한 클래스 */
.async-image-block.square-ratio img {
    aspect-ratio: 1 / 1 !important;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
    .image-caption {
        color: #adb5bd;
    }
}

/* 모바일에서의 스타일 조정 */
@media (max-width: 767.98px) {
    .image-container {
        margin: 0.75rem 0;
    }

    .image-caption {
        font-size: 0.8rem;
        margin-top: 0.375rem;
    }
}
</style>
