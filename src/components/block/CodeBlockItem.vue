<template>
    <div class="code-block-container">
        <!-- 헤더 영역 -->
        <div class="code-block-header">
            <div class="d-flex justify-content-between align-items-center">
                <!-- 언어 뱃지 -->
                <div class="language-info">
                    <span class="badge bg-primary me-2">
                        <i class="fas fa-code me-1"></i>
                        {{ displayLanguage }}
                    </span>
                    <span v-if="lineCount > 0" class="text-muted small">
                        {{ lineCount }} lines
                    </span>
                </div>

                <!-- 복사 버튼 -->
                <div class="code-actions">
                    <button
                        @click="copyToClipboard"
                        :disabled="copyState.isLoading"
                        class="btn btn-outline-light btn-sm copy-button"
                        :class="{ 'btn-success': copyState.isSuccess }"
                        type="button"
                        title="코드 복사"
                    >
                        <i :class="getCopyIconClass()" class="me-1"></i>
                        {{ getCopyButtonText() }}
                    </button>
                </div>
            </div>
        </div>

        <!-- 코드 본문 -->
        <div class="code-block-content">
            <pre class="hljs-code" :class="{ 'line-numbers': showLineNumbers }"><code
        v-html="highlightedCode"
        class="hljs"
      ></code></pre>
        </div>

        <!-- 캡션 -->
        <div v-if="codeBlock.captions && codeBlock.captions.length > 0" class="code-block-caption">
            <RichTextRenderer :rich-texts="codeBlock.captions" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CodeBlock } from '@/api/generated/api'
import { CodeHighlighter } from '@/services/CodeHighlighter'
import RichTextRenderer from '@/components/RichTextRenderer.vue'

interface Props {
    codeBlock: CodeBlock
    showLineNumbers?: boolean
}

interface CopyState {
    isLoading: boolean
    isSuccess: boolean
    error: string | null
}

const props = withDefaults(defineProps<Props>(), {
    showLineNumbers: true
})

// 복사 상태 관리
const copyState = ref<CopyState>({
    isLoading: false,
    isSuccess: false,
    error: null
})

// 코드 하이라이터 인스턴스
const highlighter = CodeHighlighter.getInstance()

/**
 * RichText 배열을 하나의 코드 문자열로 결합
 */
const rawCode = computed((): string => {
    if (!props.codeBlock.text || props.codeBlock.text.length === 0) {
        return ''
    }

    return props.codeBlock.text.map((richText) => richText.text || '').join('')
})

/**
 * 구문 강조가 적용된 HTML 코드
 */
const highlightedCode = computed((): string => {
    if (!rawCode.value) {
        return ''
    }

    return highlighter.highlight(rawCode.value, props.codeBlock.language || 'plaintext')
})

/**
 * 표시할 언어명
 */
const displayLanguage = computed((): string => {
    return highlighter.getLanguageDisplayName(props.codeBlock.language || 'plaintext')
})

/**
 * 코드 라인 수
 */
const lineCount = computed((): number => {
    if (!rawCode.value) {
        return 0
    }

    return rawCode.value.split('\n').length
})

/**
 * 클립보드에 코드 복사
 */
const copyToClipboard = async (): Promise<void> => {
    try {
        copyState.value.isLoading = true
        copyState.value.error = null

        // 클립보드 API 지원 여부 확인
        if (!navigator.clipboard) {
            throw new Error('클립보드 API가 지원되지 않습니다.')
        }

        // 코드 복사 실행
        await navigator.clipboard.writeText(rawCode.value)

        // 성공 상태 표시
        copyState.value.isSuccess = true

        // 2초 후 상태 초기화
        setTimeout(() => {
            copyState.value.isSuccess = false
        }, 2000)
    } catch (error) {
        console.error('코드 복사 실패:', error)
        copyState.value.error = error instanceof Error ? error.message : '복사에 실패했습니다.'

        // 폴백: 구식 방법으로 텍스트 선택
        try {
            const textArea = document.createElement('textarea')
            textArea.value = rawCode.value
            textArea.style.position = 'fixed'
            textArea.style.opacity = '0'
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)

            copyState.value.isSuccess = true
            setTimeout(() => {
                copyState.value.isSuccess = false
            }, 2000)
        } catch (fallbackError) {
            console.error('폴백 복사도 실패:', fallbackError)
        }
    } finally {
        copyState.value.isLoading = false
    }
}

/**
 * 복사 버튼 아이콘 클래스 반환
 */
const getCopyIconClass = (): string => {
    if (copyState.value.isLoading) {
        return 'fas fa-spinner fa-spin'
    } else if (copyState.value.isSuccess) {
        return 'fas fa-check'
    } else {
        return 'far fa-copy'
    }
}

/**
 * 복사 버튼 텍스트 반환
 */
const getCopyButtonText = (): string => {
    if (copyState.value.isLoading) {
        return '복사중...'
    } else if (copyState.value.isSuccess) {
        return '복사됨!'
    } else {
        return '복사'
    }
}

// 컴포넌트 마운트 시 실행
onMounted(() => {
    // highlight.js 스타일이 제대로 로드되었는지 확인
    console.debug('CodeBlockRenderer mounted:', {
        language: props.codeBlock.language,
        codeLength: rawCode.value.length,
        lineCount: lineCount.value
    })
})
</script>

<style lang="scss" scoped>
.code-block-container {
    margin: 1.5rem 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: #2b2b2b; // Darcula 베이스 색상
    border: 1px solid #3c3f41;
}

.code-block-header {
    background: linear-gradient(135deg, #3c3f41 0%, #2b2b2b 100%);
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #555;

    .language-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .badge {
            font-family: 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-weight: 500;
            background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%) !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    }

    .code-actions {
        .copy-button {
            font-size: 0.875rem;
            padding: 0.375rem 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
            transition: all 0.2s ease;

            &:hover:not(:disabled) {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.3);
                color: #ffffff;
            }

            &:active {
                background: rgba(255, 255, 255, 0.15);
            }

            &.btn-success {
                background: #28a745;
                border-color: #28a745;
                color: #ffffff;

                &:hover {
                    background: #218838;
                    border-color: #218838;
                }
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }
    }
}

.code-block-content {
    background: #2b2b2b;

    .hljs-code {
        margin: 0;
        padding: 1.5rem;
        background: transparent;
        font-family: 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9rem;
        line-height: 1.6;
        overflow-x: auto;
        color: #a9b7c6; // Darcula 기본 텍스트 색상

        code {
            background: transparent;
            border: none;
            padding: 0;
            color: inherit;
            font-size: inherit;
            white-space: pre;
            word-wrap: normal;
            overflow-wrap: normal;
        }
    }

    // 라인 넘버 스타일 (선택사항)
    .line-numbers {
        position: relative;
        padding-left: 3.5rem;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 3rem;
            background: #323232;
            border-right: 1px solid #555;
        }
    }
}

.code-block-caption {
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-top: 1px solid #555;
    font-size: 0.875rem;
    color: #a9b7c6;
    font-style: italic;
}

// 다크 테마 highlight.js 커스텀 색상 (Darcula 스타일)
:deep(.hljs) {
    background: transparent;
    color: #a9b7c6;
}

:deep(.hljs-keyword),
:deep(.hljs-selector-tag),
:deep(.hljs-built_in) {
    color: #cc7832;
}

:deep(.hljs-string),
:deep(.hljs-title),
:deep(.hljs-section) {
    color: #6a8759;
}

:deep(.hljs-comment),
:deep(.hljs-quote) {
    color: #808080;
    font-style: italic;
}

:deep(.hljs-number),
:deep(.hljs-literal) {
    color: #6897bb;
}

:deep(.hljs-function),
:deep(.hljs-class),
:deep(.hljs-type) {
    color: #ffc66d;
}

:deep(.hljs-variable),
:deep(.hljs-attr) {
    color: #9876aa;
}

:deep(.hljs-symbol),
:deep(.hljs-bullet),
:deep(.hljs-meta) {
    color: #bbb529;
}

:deep(.hljs-operator) {
    color: #a9b7c6;
}

:deep(.hljs-emphasis) {
    font-style: italic;
}

:deep(.hljs-strong) {
    font-weight: bold;
}

// 스크롤바 커스터마이징 (webkit 브라우저)
.hljs-code::-webkit-scrollbar {
    height: 8px;
    background: #2b2b2b;
}

.hljs-code::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
}

.hljs-code::-webkit-scrollbar-thumb:hover {
    background: #666;
}

// 반응형 디자인
@media (max-width: 768px) {
    .code-block-container {
        border-radius: 8px;
        margin: 1rem 0;
    }

    .code-block-header {
        padding: 0.5rem;
        flex-direction: column;
        gap: 0.5rem;

        .d-flex {
            flex-direction: column;
            align-items: flex-start;
        }
    }

    .code-block-content .hljs-code {
        padding: 1rem;
        font-size: 0.8rem;
    }
}

// 프린트 스타일
@media print {
    .code-block-container {
        border: 1px solid #ccc;
        box-shadow: none;
        background: #fff;
        color: #000;

        .copy-button {
            display: none;
        }

        .hljs-code {
            background: #fff;
            color: #000;
        }
    }
}
</style>
