<template>
    <div class="code-block-container">
        <!-- 헤더 영역 -->
        <div class="code-block-header">
            <div class="d-flex align-items-center justify-content-between flex-nowrap">
                <!-- 언어 뱃지 -->
                <div class="language-info d-flex align-items-center gap-2 min-w-0 flex-grow-1">
                    <span class="badge bg-primary flex-shrink-0">
                        <i class="fas fa-code me-1"></i>
                        {{ displayLanguage }}
                    </span>
                    <span v-if="lineCount > 0" class="text-muted small text-truncate">
                        {{ lineCount }} lines
                    </span>
                </div>

                <!-- 복사 버튼 -->
                <div class="code-actions flex-shrink-0 ms-2">
                    <button
                        @click="copyToClipboard"
                        :disabled="copyState.isLoading"
                        class="btn btn-outline-light btn-sm copy-button"
                        :class="{ 'btn-success': copyState.isSuccess }"
                        type="button"
                        title="코드 복사"
                    >
                        <i :class="getCopyIconClass()" class="me-1"></i>
                        <span class="d-none d-sm-inline">{{ getCopyButtonText() }}</span>
                        <span class="d-sm-none">{{ getCopyButtonText().slice(0, 2) }}</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 코드 본문 -->
        <div class="code-block-content">
            <pre class="hljs-code" :class="{ 'line-numbers': showLineNumbers }">
                <code
                    ref="codeElementRef"
                    v-html="highlightedCode"
                    class="hljs"
                ></code>
            </pre>
        </div>

        <!-- 캡션 -->
        <div v-if="codeBlock.captions && codeBlock.captions.length > 0" class="code-block-caption">
            <RichTextRenderer :rich-texts="codeBlock.captions" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import type { CodeBlock } from '../../api/generated/api'
import { CodeHighlighter } from '../../services/CodeHighlighter'
import RichTextRenderer from '../RichTextRenderer.vue'
import hljs from 'highlight.js'
import 'highlightjs-line-numbers.js'

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

// 코드 요소 DOM 참조
const codeElementRef = ref<HTMLElement | null>(null)

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
            // 클립보드 API가 지원되지 않는 경우 바로 폴백 방법 사용
            copyState.value.error = '클립보드 API가 지원되지 않습니다.'

            // 폴백: 구식 방법으로 텍스트 선택
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
            return
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

/**
 * 줄 번호 적용
 */
const applyLineNumbers = async (): Promise<void> => {
    if (!props.showLineNumbers || !codeElementRef.value) {
        console.log('Line numbers not applied: showLineNumbers =', props.showLineNumbers, ', codeElementRef =', codeElementRef.value)
        return
    }

    // Vue DOM 업데이트가 완료될 때까지 대기
    await nextTick()

    // DOM 렌더링이 완전히 끝날 때까지 추가 지연
    setTimeout(() => {
        if (!codeElementRef.value) return

        try {
            // highlightjs-line-numbers.js 플러그인이 로드되었는지 확인
            if (!(hljs as any).lineNumbersBlock) {
                console.error('highlightjs-line-numbers.js plugin not loaded')
                return
            }

            // 기존 줄 번호 테이블이 있으면 제거
            const parentElement = codeElementRef.value.parentElement;
            if (parentElement) {
                const existingTable = parentElement.querySelector('.hljs-ln');
                if (existingTable) {
                    console.log('Removing existing line numbers table');
                    existingTable.remove();
                }
            }

            console.log('Applying line numbers to code element:', codeElementRef.value);
            // Line count 로깅 제거 - 타입스크립트 오류 해결을 위해

            // code 요소에 줄 번호 적용
            (hljs as any).lineNumbersBlock(codeElementRef.value, {
                singleLine: lineCount.value === 1,
                startFrom: 1
            });

            console.log('Line numbers applied successfully');

            // 적용 후 확인
            const appliedTable = codeElementRef.value.parentElement?.querySelector('.hljs-ln');
            console.log('Line number table found after application:', !!appliedTable);

        } catch (error) {
            console.error('Failed to apply line numbers:', error);
        }
    }, 150); // 150ms 지연으로 안정성 확보
};

// highlightedCode가 변경될 때마다 줄 번호 재적용
watch(highlightedCode, () => {
    if (props.showLineNumbers) {
        applyLineNumbers()
    }
}, { flush: 'post' })

// showLineNumbers가 변경될 때 줄 번호 적용/제거
watch(() => props.showLineNumbers, (newValue) => {
    if (newValue) {
        applyLineNumbers()
    } else {
        // 줄 번호 제거
        nextTick(() => {
            if (codeElementRef.value && codeElementRef.value.parentElement) {
                const existingTable = codeElementRef.value.parentElement.querySelector('.hljs-ln')
                if (existingTable) {
                    existingTable.remove()
                }
            }
        })
    }
})

// 컴포넌트 마운트 시 실행
onMounted(() => {
    // highlight.js 스타일이 제대로 로드되었는지 확인
    console.debug('CodeBlockRenderer mounted:', {
        language: props.codeBlock.language,
        codeLength: rawCode.value.length,
        lineCount: lineCount.value
    })

    // 줄 번호 적용
    if (props.showLineNumbers) {
        applyLineNumbers()
    }
})
</script>

<style lang="scss" scoped>
.code-block-container {
    margin: 1.5rem 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: #ffffff;
    border: 1px solid #e1e4e8;
}

.code-block-header {
    background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e1e4e8;

    .language-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .badge {
            font-family: 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-weight: 500;
            background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%) !important;
            border: 1px solid rgba(13, 110, 253, 0.2);
            color: #ffffff;
        }

        .text-muted {
            color: #6a737d !important;
        }
    }

    .code-actions {
        .copy-button {
            font-size: 0.875rem;
            padding: 0.375rem 0.75rem;
            border: 1px solid #d1d5da;
            background: #ffffff;
            color: #586069;
            transition: all 0.2s ease;

            &:hover:not(:disabled) {
                background: #f6f8fa;
                border-color: #c6cbd1;
                color: #24292e;
            }

            &:active {
                background: #edeff2;
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
    background: #ffffff;

    .hljs-code {
        margin: 0;
        padding: 1.5rem;
        background: transparent;
        font-family: 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9rem;
        line-height: 1.6;
        overflow-x: auto;
        color: #24292e;

        // 줄 번호가 있을 때 패딩 제거
        &:has(.hljs-ln) {
            padding: 0;
        }

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
}

.code-block-caption {
    padding: 0.75rem 1rem;
    background: #f6f8fa;
    border-top: 1px solid #e1e4e8;
    font-size: 0.875rem;
    color: #586069;
    font-style: italic;
}

// GitHub Light 테마 highlight.js 커스텀 색상
:deep(.hljs) {
    background: transparent;
    color: #24292e;
}

:deep(.hljs-keyword),
:deep(.hljs-selector-tag),
:deep(.hljs-built_in) {
    color: #d73a49;
}

:deep(.hljs-string),
:deep(.hljs-title),
:deep(.hljs-section) {
    color: #032f62;
}

:deep(.hljs-comment),
:deep(.hljs-quote) {
    color: #6a737d;
    font-style: italic;
}

:deep(.hljs-number),
:deep(.hljs-literal) {
    color: #005cc5;
}

:deep(.hljs-function),
:deep(.hljs-class),
:deep(.hljs-type) {
    color: #6f42c1;
}

:deep(.hljs-variable),
:deep(.hljs-attr) {
    color: #e36209;
}

:deep(.hljs-symbol),
:deep(.hljs-bullet),
:deep(.hljs-meta) {
    color: #d73a49;
}

:deep(.hljs-operator) {
    color: #d73a49;
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
    background: #f6f8fa;
}

.hljs-code::-webkit-scrollbar-thumb {
    background: #d1d5da;
    border-radius: 4px;
}

.hljs-code::-webkit-scrollbar-thumb:hover {
    background: #c6cbd1;
}

// 반응형 디자인
@media (max-width: 768px) {
    .code-block-container {
        border-radius: 8px;
        margin: 1rem 0;
    }

    .code-block-header {
        padding: 0.75rem;

        // 헤더 레이아웃을 유지하면서 공간 최적화
        .d-flex {
            gap: 0.5rem;
        }

        .language-info {
            gap: 0.25rem;
            min-width: 0;

            .badge {
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
            }

            .text-muted {
                font-size: 0.75rem;
            }
        }

        .code-actions {
            .copy-button {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                min-width: auto;
            }
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
