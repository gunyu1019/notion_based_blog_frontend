<template>
    <div class="file-block-item mb-4">
        <div class="card file-card h-100" :class="{ 'file-available': isFileAvailable }">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <!-- 파일 아이콘 영역 -->
                    <div class="file-icon-container me-3">
                        <i
                            :class="getFileIconClass()"
                            class="file-icon"
                            :title="getFileTypeDescription()"
                        ></i>
                    </div>

                    <!-- 파일 정보 영역 -->
                    <div class="flex-grow-1 min-w-0">
                        <!-- 파일명 -->
                        <h6 class="card-title mb-1">
                            <span class="file-name">{{ getFileName() }}</span>
                            <span v-if="getFileExtension()" class="badge bg-secondary ms-2">
                                {{ getFileExtension().toUpperCase() }}
                            </span>
                        </h6>

                        <!-- 파일 정보 -->
                        <div class="file-info mb-2">
                            <small class="text-muted d-flex align-items-center flex-wrap">
                                <span v-if="getFileSize()" class="me-3">
                                    <i class="fas fa-file-alt me-1"></i>
                                    {{ getFileSize() }}
                                </span>
                                <span v-if="getFileType()" class="me-3">
                                    <i class="fas fa-tag me-1"></i>
                                    {{ getFileType() }}
                                </span>
                                <span v-if="isFileAvailable" class="text-success">
                                    <i class="fas fa-check-circle me-1"></i>
                                    다운로드 가능
                                </span>
                                <span v-else class="text-warning">
                                    <i class="fas fa-exclamation-triangle me-1"></i>
                                    파일 없음
                                </span>
                            </small>
                        </div>

                        <!-- 파일 설명 -->
                        <div v-if="hasDescription" class="file-description mb-3">
                            <RichTextRenderer :rich-texts="fileBlock.text || []" />
                        </div>

                        <!-- 파일 액션 버튼들 -->
                        <div class="file-actions">
                            <div class="btn-group btn-group-sm" role="group">
                                <!-- 다운로드 버튼 -->
                                <button
                                    v-if="isFileAvailable"
                                    @click="downloadFile"
                                    :disabled="downloadState.isLoading"
                                    class="btn btn-success"
                                    type="button"
                                    title="파일 다운로드"
                                >
                                    <i :class="getDownloadIconClass()" class="me-1"></i>
                                    {{ getDownloadButtonText() }}
                                </button>

                                <!-- 파일 정보 버튼 -->
                                <button
                                    v-if="isFileAvailable"
                                    @click="toggleFileInfo"
                                    class="btn btn-outline-primary"
                                    type="button"
                                    title="파일 정보 보기"
                                >
                                    <i class="fas fa-info-circle me-1"></i>
                                    정보
                                </button>

                                <!-- URL 복사 버튼 -->
                                <button
                                    v-if="isFileAvailable && getFileUrl()"
                                    @click="copyFileUrl"
                                    :disabled="copyState.isLoading"
                                    class="btn btn-outline-secondary"
                                    :class="{ 'btn-success': copyState.isSuccess }"
                                    type="button"
                                    title="파일 URL 복사"
                                >
                                    <i :class="getCopyIconClass()" class="me-1"></i>
                                    {{ getCopyButtonText() }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 파일 상세 정보 (토글 가능) -->
                <div
                    v-if="showFileInfo && isFileAvailable"
                    class="file-details mt-3 pt-3 border-top"
                >
                    <h6 class="mb-2">
                        <i class="fas fa-info-circle me-1"></i>
                        파일 세부 정보
                    </h6>
                    <div class="row g-2">
                        <div v-if="getFileUrl()" class="col-12">
                            <small class="text-muted d-block">
                                <strong>URL:</strong>
                                <code class="file-url">{{ getFileUrl() }}</code>
                            </small>
                        </div>
                        <div v-if="getExpiryTime()" class="col-12">
                            <small class="text-muted d-block">
                                <strong>만료 시간:</strong>
                                <span :class="{ 'text-danger': isExpiringSoon() }">
                                    {{ getFormattedExpiryTime() }}
                                </span>
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 캡션 -->
        <div v-if="fileBlock.captions && fileBlock.captions.length > 0" class="file-caption mt-2">
            <small class="text-muted">
                <i class="fas fa-quote-left me-1"></i>
                <RichTextRenderer :rich-texts="fileBlock.captions" />
            </small>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import RichTextRenderer from '@/components/RichTextRenderer.vue'
import type { FileBlock } from '@/api/generated/api'

interface Props {
    fileBlock: FileBlock
}

interface DownloadState {
    isLoading: boolean
    progress: number
    error: string | null
}

interface CopyState {
    isLoading: boolean
    isSuccess: boolean
    error: string | null
}

const props = defineProps<Props>()

// 상태 관리
const showFileInfo = ref(false)
const downloadState = reactive<DownloadState>({
    isLoading: false,
    progress: 0,
    error: null
})
const copyState = reactive<CopyState>({
    isLoading: false,
    isSuccess: false,
    error: null
})

/**
 * 파일이 사용 가능한지 확인
 */
const isFileAvailable = computed((): boolean => {
    return Boolean(props.fileBlock.is_file_available && props.fileBlock.file)
})

/**
 * 설명 텍스트가 있는지 확인
 */
const hasDescription = computed((): boolean => {
    return Boolean(
        props.fileBlock.text &&
        props.fileBlock.text.length > 0 &&
        props.fileBlock.text.some((t) => t.text?.trim())
    )
})

/**
 * 파일명 추출
 */
const getFileName = (): string => {
    // 텍스트에서 파일명 찾기
    if (hasDescription.value) {
        const firstText = props.fileBlock.text![0]?.text?.trim()
        if (firstText) return firstText
    }

    // URL에서 파일명 추출
    const fileUrl = getFileUrl()
    if (fileUrl) {
        try {
            const url = new URL(fileUrl)
            const pathname = url.pathname
            const filename = pathname.split('/').pop()
            if (filename && filename !== '') {
                return decodeURIComponent(filename)
            }
        } catch {
            // URL 파싱 실패 시 무시
        }
    }

    return '알 수 없는 파일'
}

/**
 * 파일 확장자 추출
 */
const getFileExtension = (): string => {
    const fileName = getFileName()
    const lastDot = fileName.lastIndexOf('.')
    return lastDot !== -1 ? fileName.substring(lastDot + 1) : ''
}

/**
 * 파일 URL 가져오기
 */
const getFileUrl = (): string => {
    if (props.fileBlock.file && typeof props.fileBlock.file === 'object') {
        return props.fileBlock.file.url || ''
    }
    return ''
}

/**
 * 파일 타입 추정
 */
const getFileType = (): string => {
    const extension = getFileExtension().toLowerCase()

    const typeMap: Record<string, string> = {
        // 문서
        pdf: 'PDF 문서',
        doc: 'Word 문서',
        docx: 'Word 문서',
        xls: 'Excel 스프레드시트',
        xlsx: 'Excel 스프레드시트',
        ppt: 'PowerPoint 프레젠테이션',
        pptx: 'PowerPoint 프레젠테이션',
        txt: '텍스트 파일',

        // 이미지
        jpg: 'JPEG 이미지',
        jpeg: 'JPEG 이미지',
        png: 'PNG 이미지',
        gif: 'GIF 이미지',
        svg: 'SVG 벡터 이미지',
        webp: 'WebP 이미지',

        // 비디오
        mp4: 'MP4 비디오',
        avi: 'AVI 비디오',
        mov: 'QuickTime 비디오',
        wmv: 'Windows Media 비디오',

        // 오디오
        mp3: 'MP3 오디오',
        wav: 'WAV 오디오',
        flac: 'FLAC 오디오',

        // 압축
        zip: 'ZIP 압축파일',
        rar: 'RAR 압축파일',
        '7z': '7-Zip 압축파일',

        // 코드
        js: 'JavaScript 파일',
        ts: 'TypeScript 파일',
        html: 'HTML 파일',
        css: 'CSS 파일',
        json: 'JSON 파일'
    }

    return typeMap[extension] || '파일'
}

/**
 * 파일 크기 (임시 구현 - 실제로는 API에서 제공해야 함)
 */
const getFileSize = (): string => {
    // 실제 구현에서는 API에서 파일 크기 정보를 받아와야 함
    return ''
}

/**
 * 만료 시간 가져오기
 */
const getExpiryTime = (): string | null => {
    if (props.fileBlock.file && typeof props.fileBlock.file === 'object') {
        return props.fileBlock.file.expiry_time || null
    }
    return null
}

/**
 * 포맷된 만료 시간
 */
const getFormattedExpiryTime = (): string => {
    const expiryTime = getExpiryTime()
    if (!expiryTime) return ''

    try {
        const date = new Date(expiryTime)
        return date.toLocaleString('ko-KR')
    } catch {
        return expiryTime
    }
}

/**
 * 곧 만료되는지 확인 (24시간 이내)
 */
const isExpiringSoon = (): boolean => {
    const expiryTime = getExpiryTime()
    if (!expiryTime) return false

    try {
        const expiryDate = new Date(expiryTime)
        const now = new Date()
        const timeDiff = expiryDate.getTime() - now.getTime()
        const hoursDiff = timeDiff / (1000 * 3600)

        return hoursDiff <= 24 && hoursDiff > 0
    } catch {
        return false
    }
}

/**
 * 파일 아이콘 클래스
 */
const getFileIconClass = (): string => {
    if (!isFileAvailable.value) {
        return 'fas fa-file-times text-muted'
    }

    const extension = getFileExtension().toLowerCase()

    // 확장자별 아이콘 매핑
    const iconMap: Record<string, string> = {
        // 문서
        pdf: 'fas fa-file-pdf text-danger',
        doc: 'fas fa-file-word text-primary',
        docx: 'fas fa-file-word text-primary',
        xls: 'fas fa-file-excel text-success',
        xlsx: 'fas fa-file-excel text-success',
        ppt: 'fas fa-file-powerpoint text-warning',
        pptx: 'fas fa-file-powerpoint text-warning',
        txt: 'fas fa-file-alt text-secondary',

        // 이미지
        jpg: 'fas fa-file-image text-info',
        jpeg: 'fas fa-file-image text-info',
        png: 'fas fa-file-image text-info',
        gif: 'fas fa-file-image text-info',
        svg: 'fas fa-file-image text-info',
        webp: 'fas fa-file-image text-info',

        // 비디오
        mp4: 'fas fa-file-video text-primary',
        avi: 'fas fa-file-video text-primary',
        mov: 'fas fa-file-video text-primary',
        wmv: 'fas fa-file-video text-primary',

        // 오디오
        mp3: 'fas fa-file-audio text-success',
        wav: 'fas fa-file-audio text-success',
        flac: 'fas fa-file-audio text-success',

        // 압축
        zip: 'fas fa-file-archive text-warning',
        rar: 'fas fa-file-archive text-warning',
        '7z': 'fas fa-file-archive text-warning',

        // 코드
        js: 'fas fa-file-code text-warning',
        ts: 'fas fa-file-code text-primary',
        html: 'fas fa-file-code text-danger',
        css: 'fas fa-file-code text-info',
        json: 'fas fa-file-code text-secondary'
    }

    return iconMap[extension] || 'fas fa-file text-secondary'
}

/**
 * 파일 타입 설명
 */
const getFileTypeDescription = (): string => {
    return getFileType()
}

/**
 * 파일 정보 토글
 */
const toggleFileInfo = (): void => {
    showFileInfo.value = !showFileInfo.value
}

/**
 * 파일 다운로드
 */
const downloadFile = async (): Promise<void> => {
    const fileUrl = getFileUrl()
    if (!fileUrl || !isFileAvailable.value) return

    try {
        downloadState.isLoading = true
        downloadState.error = null

        // 새 창에서 파일 URL 열기 (다운로드 시작)
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = getFileName()
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error('파일 다운로드 실패:', error)
        downloadState.error = '다운로드에 실패했습니다.'
    } finally {
        downloadState.isLoading = false
    }
}

/**
 * 파일 URL 복사
 */
const copyFileUrl = async (): Promise<void> => {
    const fileUrl = getFileUrl()
    if (!fileUrl) return

    try {
        copyState.isLoading = true
        copyState.error = null

        if (!navigator.clipboard) {
            throw new Error('클립보드 API가 지원되지 않습니다.')
        }

        await navigator.clipboard.writeText(fileUrl)

        copyState.isSuccess = true
        setTimeout(() => {
            copyState.isSuccess = false
        }, 2000)
    } catch (error) {
        console.error('URL 복사 실패:', error)
        copyState.error = error instanceof Error ? error.message : '복사에 실패했습니다.'

        // 폴백
        try {
            const textArea = document.createElement('textarea')
            textArea.value = fileUrl
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
 * 다운로드 버튼 아이콘 클래스
 */
const getDownloadIconClass = (): string => {
    if (downloadState.isLoading) return 'fas fa-spinner fa-spin'
    return 'fas fa-download'
}

/**
 * 다운로드 버튼 텍스트
 */
const getDownloadButtonText = (): string => {
    if (downloadState.isLoading) return '다운로드 중...'
    return '다운로드'
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
</script>

<style scoped lang="scss">
.file-block-item {
    .file-card {
        border: 1px solid #dee2e6;
        border-radius: 12px;
        transition: all 0.2s ease;
        background: #fff;

        &.file-available {
            border-color: #28a745;
            background: linear-gradient(135deg, #fff 0%, rgba(40, 167, 69, 0.02) 100%);

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(40, 167, 69, 0.15);
            }
        }

        .card-body {
            padding: 1.25rem;
        }

        .file-icon-container {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 12px;
            background: #f8f9fa;
            border: 2px solid #e9ecef;

            .file-icon {
                font-size: 1.75rem;
            }
        }

        .card-title {
            font-size: 1.1rem;
            font-weight: 600;
            line-height: 1.3;

            .file-name {
                word-break: break-word;
            }

            .badge {
                font-size: 0.7em;
                vertical-align: top;
            }
        }

        .file-info {
            font-size: 0.875rem;

            span {
                display: inline-flex;
                align-items: center;
                margin-bottom: 0.25rem;
            }
        }

        .file-description {
            color: #6c757d;
            font-size: 0.95rem;
            line-height: 1.5;
        }

        .file-actions {
            .btn-group .btn {
                font-size: 0.875rem;
                padding: 0.375rem 0.75rem;

                &:focus {
                    box-shadow: none;
                }
            }
        }

        .file-details {
            background: rgba(0, 0, 0, 0.02);
            border-radius: 8px;
            padding: 0.75rem;

            h6 {
                color: #495057;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }

            .file-url {
                background: #f8f9fa;
                color: #495057;
                font-size: 0.8em;
                word-break: break-all;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
            }
        }
    }

    .file-caption {
        text-align: center;
        font-style: italic;
        margin-top: 0.5rem;
    }
}

// 파일 타입별 아이콘 컨테이너 색상
.file-icon-container {
    &:has(.fa-file-pdf) {
        background: rgba(220, 53, 69, 0.1);
        border-color: rgba(220, 53, 69, 0.2);
    }

    &:has(.fa-file-word) {
        background: rgba(0, 123, 255, 0.1);
        border-color: rgba(0, 123, 255, 0.2);
    }

    &:has(.fa-file-excel) {
        background: rgba(40, 167, 69, 0.1);
        border-color: rgba(40, 167, 69, 0.2);
    }

    &:has(.fa-file-powerpoint) {
        background: rgba(255, 193, 7, 0.1);
        border-color: rgba(255, 193, 7, 0.2);
    }

    &:has(.fa-file-image) {
        background: rgba(23, 162, 184, 0.1);
        border-color: rgba(23, 162, 184, 0.2);
    }

    &:has(.fa-file-video) {
        background: rgba(102, 16, 242, 0.1);
        border-color: rgba(102, 16, 242, 0.2);
    }

    &:has(.fa-file-audio) {
        background: rgba(25, 135, 84, 0.1);
        border-color: rgba(25, 135, 84, 0.2);
    }

    &:has(.fa-file-archive) {
        background: rgba(253, 126, 20, 0.1);
        border-color: rgba(253, 126, 20, 0.2);
    }

    &:has(.fa-file-code) {
        background: rgba(111, 66, 193, 0.1);
        border-color: rgba(111, 66, 193, 0.2);
    }
}

// 반응형 디자인
@media (max-width: 768px) {
    .file-block-item {
        .file-card {
            .card-body {
                padding: 1rem;
            }

            .file-icon-container {
                width: 48px;
                height: 48px;
                margin-right: 0.75rem;

                .file-icon {
                    font-size: 1.5rem;
                }
            }

            .card-title {
                font-size: 1rem;
            }

            .file-actions .btn-group .btn {
                font-size: 0.8rem;
                padding: 0.25rem 0.5rem;
            }
        }
    }
}

// 다크 모드 지원
@media (prefers-color-scheme: dark) {
    .file-block-item {
        .file-card {
            background: #212529;
            border-color: #495057;
            color: #fff;

            &.file-available {
                border-color: #28a745;
                background: linear-gradient(135deg, #212529 0%, rgba(40, 167, 69, 0.1) 100%);
            }

            .file-icon-container {
                background: #343a40;
                border-color: #495057;
            }

            .file-description {
                color: #adb5bd;
            }

            .file-details {
                background: rgba(255, 255, 255, 0.05);

                .file-url {
                    background: #343a40;
                    color: #adb5bd;
                }
            }
        }
    }
}

// 프린트 스타일
@media print {
    .file-block-item {
        .file-card {
            box-shadow: none;
            border: 1px solid #000;

            .file-actions {
                display: none;
            }

            .file-details {
                background: transparent;
            }
        }
    }
}
</style>
