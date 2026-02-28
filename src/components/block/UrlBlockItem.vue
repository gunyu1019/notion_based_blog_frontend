<template>
    <div class="url-block-item mb-4">
        <div class="card url-card h-100" :class="{ 'card-clickable': isValidUrl }">
            <div class="card-body">
                <div class="d-flex align-items-start">
                    <!-- 아이콘 영역 -->
                    <div class="url-icon-container me-3">
                        <i :class="getIconClass()" class="url-icon" :title="getIconTitle()"></i>
                    </div>

                    <!-- 콘텐츠 영역 -->
                    <div class="flex-grow-1 min-w-0">
                        <!-- URL 및 제목 -->
                        <div class="url-header mb-2">
                            <h6 class="card-title mb-1">
                                <a
                                    v-if="isValidUrl"
                                    :href="urlBlock.url"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="url-link text-decoration-none"
                                    @click="handleLinkClick"
                                >
                                    <span class="url-text">{{ getDisplayTitle() }}</span>
                                    <i class="fas fa-external-link-alt ms-1 external-icon"></i>
                                </a>
                                <span v-else class="text-muted">
                                    {{ getDisplayTitle() }}
                                </span>
                            </h6>

                            <!-- URL 주소 표시 -->
                            <div class="url-address">
                                <small class="text-muted d-flex align-items-center">
                                    <i class="fas fa-globe me-1"></i>
                                    <span class="url-domain">{{ getDisplayUrl() }}</span>
                                </small>
                            </div>
                        </div>

                        <!-- 설명 텍스트 -->
                        <div v-if="hasDescription" class="url-description">
                            <RichTextRenderer :rich-texts="urlBlock.text || []" />
                        </div>

                        <!-- 액션 버튼들 -->
                        <div v-if="isValidUrl" class="url-actions mt-3">
                            <div class="btn-group btn-group-sm" role="group">
                                <button
                                    @click="openUrl"
                                    class="btn btn-outline-primary"
                                    type="button"
                                    title="새 탭에서 열기"
                                >
                                    <i class="fas fa-external-link-alt me-1"></i>
                                    열기
                                </button>
                                <button
                                    @click="copyUrl"
                                    :disabled="copyState.isLoading"
                                    class="btn btn-outline-secondary"
                                    :class="{ 'btn-success': copyState.isSuccess }"
                                    type="button"
                                    title="URL 복사"
                                >
                                    <i :class="getCopyIconClass()" class="me-1"></i>
                                    {{ getCopyButtonText() }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- URL 프리뷰 이미지 (선택사항) -->
            <div v-if="hasPreviewImage" class="url-preview-image">
                <img
                    :src="previewImageUrl"
                    :alt="getDisplayTitle()"
                    class="card-img-bottom"
                    loading="lazy"
                    @error="handleImageError"
                />
            </div>
        </div>

        <!-- 캡션 -->
        <div v-if="urlBlock.captions && urlBlock.captions.length > 0" class="url-caption mt-2">
            <small class="text-muted">
                <i class="fas fa-quote-left me-1"></i>
                <RichTextRenderer :rich-texts="urlBlock.captions" />
            </small>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import RichTextRenderer from '@/components/RichTextRenderer.vue'
import type { UrlBlock } from '@/api/generated/api'

interface Props {
    urlBlock: UrlBlock
}

interface CopyState {
    isLoading: boolean
    isSuccess: boolean
    error: string | null
}

const props = defineProps<Props>()

// 복사 상태 관리
const copyState = reactive<CopyState>({
    isLoading: false,
    isSuccess: false,
    error: null
})

// 프리뷰 이미지 상태
const previewImageUrl = ref<string>('')
const imageLoadError = ref(false)

/**
 * 유효한 URL인지 확인
 */
const isValidUrl = computed((): boolean => {
    try {
        if (!props.urlBlock.url) return false
        new URL(props.urlBlock.url)
        return true
    } catch {
        return false
    }
})

/**
 * 설명 텍스트가 있는지 확인
 */
const hasDescription = computed((): boolean => {
    return Boolean(
        props.urlBlock.text &&
        props.urlBlock.text.length > 0 &&
        props.urlBlock.text.some((t) => t.text?.trim())
    )
})

/**
 * 표시할 제목 생성
 */
const getDisplayTitle = (): string => {
    // 설명 텍스트가 있으면 첫 번째 텍스트를 제목으로 사용
    if (hasDescription.value) {
        const firstText = props.urlBlock.text![0]?.text?.trim()
        if (firstText) return firstText
    }

    // 설명이 없으면 URL에서 도메인 추출
    if (isValidUrl.value) {
        try {
            const url = new URL(props.urlBlock.url!)
            return url.hostname.replace(/^www\./, '')
        } catch {
            return props.urlBlock.url!
        }
    }

    return 'URL 링크'
}

/**
 * 표시할 URL 주소
 */
const getDisplayUrl = (): string => {
    if (!props.urlBlock.url) return '유효하지 않은 URL'

    try {
        const url = new URL(props.urlBlock.url)
        const domain = url.hostname.replace(/^www\./, '')
        const path = url.pathname !== '/' ? url.pathname : ''
        return domain + path
    } catch {
        return props.urlBlock.url
    }
}

/**
 * 아이콘 클래스 결정
 */
const getIconClass = (): string => {
    if (!isValidUrl.value) {
        return 'fas fa-exclamation-triangle text-warning'
    }

    const url = props.urlBlock.url!.toLowerCase()

    // 특정 도메인별 아이콘
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'fab fa-youtube text-danger'
    } else if (url.includes('github.com')) {
        return 'fab fa-github text-dark'
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
        return 'fab fa-twitter text-info'
    } else if (url.includes('linkedin.com')) {
        return 'fab fa-linkedin text-primary'
    } else if (url.includes('facebook.com')) {
        return 'fab fa-facebook text-primary'
    } else if (url.includes('instagram.com')) {
        return 'fab fa-instagram text-danger'
    } else if (url.includes('medium.com')) {
        return 'fab fa-medium text-dark'
    } else if (url.includes('stackoverflow.com')) {
        return 'fab fa-stack-overflow text-warning'
    }

    return 'fas fa-link text-primary'
}

/**
 * 아이콘 타이틀
 */
const getIconTitle = (): string => {
    if (!isValidUrl.value) return '유효하지 않은 URL'

    const url = props.urlBlock.url!.toLowerCase()

    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
    if (url.includes('github.com')) return 'GitHub'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X'
    if (url.includes('linkedin.com')) return 'LinkedIn'
    if (url.includes('facebook.com')) return 'Facebook'
    if (url.includes('instagram.com')) return 'Instagram'
    if (url.includes('medium.com')) return 'Medium'
    if (url.includes('stackoverflow.com')) return 'Stack Overflow'

    return '외부 링크'
}

/**
 * URL 열기
 */
const openUrl = (): void => {
    if (isValidUrl.value) {
        window.open(props.urlBlock.url!, '_blank', 'noopener,noreferrer')
    }
}

/**
 * 링크 클릭 처리
 */
const handleLinkClick = (event: Event): void => {
    // 기본 동작은 유지하되, 분석 등을 위해 이벤트 처리
    console.debug('URL clicked:', props.urlBlock.url)
}

/**
 * URL 복사
 */
const copyUrl = async (): Promise<void> => {
    if (!isValidUrl.value) return

    try {
        copyState.isLoading = true
        copyState.error = null

        // 클립보드 API 지원 확인
        if (!navigator.clipboard) {
            throw new Error('클립보드 API가 지원되지 않습니다.')
        }

        await navigator.clipboard.writeText(props.urlBlock.url!)

        copyState.isSuccess = true
        setTimeout(() => {
            copyState.isSuccess = false
        }, 2000)
    } catch (error) {
        console.error('URL 복사 실패:', error)
        copyState.error = error instanceof Error ? error.message : '복사에 실패했습니다.'

        // 폴백 방법
        try {
            const textArea = document.createElement('textarea')
            textArea.value = props.urlBlock.url!
            textArea.style.position = 'fixed'
            textArea.style.opacity = '0'
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)

            copyState.isSuccess = true
            setTimeout(() => {
                copyState.isSuccess = false
            }, 2000)
        } catch (fallbackError) {
            console.error('폴백 복사도 실패:', fallbackError)
        }
    } finally {
        copyState.isLoading = false
    }
}

/**
 * 복사 버튼 아이콘 클래스
 */
const getCopyIconClass = (): string => {
    if (copyState.isLoading) return 'fas fa-spinner fa-spin'
    if (copyState.isSuccess) return 'fas fa-check'
    return 'far fa-copy'
}

/**
 * 복사 버튼 텍스트
 */
const getCopyButtonText = (): string => {
    if (copyState.isLoading) return '복사중...'
    if (copyState.isSuccess) return '복사됨!'
    return '복사'
}

/**
 * 프리뷰 이미지가 있는지 확인
 */
const hasPreviewImage = computed((): boolean => {
    return Boolean(previewImageUrl.value && !imageLoadError.value)
})

/**
 * 이미지 로드 에러 처리
 */
const handleImageError = (): void => {
    imageLoadError.value = true
}
</script>

<style scoped lang="scss">
.url-block-item {
    .url-card {
        border: 1px solid #dee2e6;
        border-radius: 12px;
        transition: all 0.2s ease;
        background: #fff;

        &.card-clickable:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-color: #007bff;
        }

        .card-body {
            padding: 1.25rem;
        }

        .url-icon-container {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #f8f9fa;
            border: 2px solid #e9ecef;

            .url-icon {
                font-size: 1.5rem;
            }
        }

        .url-header {
            .card-title {
                font-size: 1.1rem;
                font-weight: 600;
                line-height: 1.3;
                margin-bottom: 0.25rem;

                .url-link {
                    color: #007bff;

                    &:hover {
                        color: #0056b3;
                        text-decoration: underline !important;
                    }

                    .url-text {
                        word-break: break-word;
                    }

                    .external-icon {
                        font-size: 0.8em;
                        opacity: 0.7;
                    }
                }
            }

            .url-address {
                .url-domain {
                    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                    font-size: 0.85em;
                    word-break: break-all;
                }
            }
        }

        .url-description {
            color: #6c757d;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-top: 0.5rem;
        }

        .url-actions {
            .btn-group {
                .btn {
                    font-size: 0.875rem;
                    padding: 0.375rem 0.75rem;

                    &.btn-success {
                        background-color: #28a745;
                        border-color: #28a745;

                        &:hover {
                            background-color: #218838;
                            border-color: #218838;
                        }
                    }
                }
            }
        }

        .url-preview-image {
            img {
                height: 200px;
                object-fit: cover;
                border-radius: 0 0 12px 12px;
            }
        }
    }

    .url-caption {
        text-align: center;
        font-style: italic;
        margin-top: 0.5rem;
    }
}

// 특정 서비스별 아이콘 컨테이너 색상
.url-icon-container {
    &:has(.fa-youtube) {
        background: rgba(255, 0, 0, 0.1);
        border-color: rgba(255, 0, 0, 0.2);
    }

    &:has(.fa-github) {
        background: rgba(0, 0, 0, 0.1);
        border-color: rgba(0, 0, 0, 0.2);
    }

    &:has(.fa-twitter) {
        background: rgba(29, 161, 242, 0.1);
        border-color: rgba(29, 161, 242, 0.2);
    }

    &:has(.fa-linkedin) {
        background: rgba(0, 119, 181, 0.1);
        border-color: rgba(0, 119, 181, 0.2);
    }

    &:has(.fa-link) {
        background: rgba(0, 123, 255, 0.1);
        border-color: rgba(0, 123, 255, 0.2);
    }
}

// 반응형 디자인
@media (max-width: 768px) {
    .url-block-item {
        .url-card {
            .card-body {
                padding: 1rem;
            }

            .url-icon-container {
                width: 40px;
                height: 40px;
                margin-right: 0.75rem;

                .url-icon {
                    font-size: 1.25rem;
                }
            }

            .url-header .card-title {
                font-size: 1rem;
            }

            .url-actions .btn-group .btn {
                font-size: 0.8rem;
                padding: 0.25rem 0.5rem;
            }
        }
    }
}

// 다크 모드 지원
@media (prefers-color-scheme: dark) {
    .url-block-item {
        .url-card {
            background: #212529;
            border-color: #495057;
            color: #fff;

            .url-icon-container {
                background: #343a40;
                border-color: #495057;
            }

            .url-header .card-title .url-link {
                color: #66b3ff;

                &:hover {
                    color: #4da6ff;
                }
            }

            .url-description {
                color: #adb5bd;
            }
        }
    }
}

// 프린트 스타일
@media print {
    .url-block-item {
        .url-card {
            box-shadow: none;
            border: 1px solid #000;

            &.card-clickable:hover {
                transform: none;
                box-shadow: none;
            }

            .url-actions {
                display: none;
            }

            .url-preview-image {
                display: none;
            }
        }
    }
}
</style>
