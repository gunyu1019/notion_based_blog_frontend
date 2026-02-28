<template>
    <div class="col-12 col-md">
        <div class="column-content h-100">
            <NotionBlock
                v-for="child in block.children"
                :key="child.id"
                :block="child"
                :depth="depth + 1"
                :max-depth="maxDepth"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import NotionBlock from './NotionBlock.vue'
import type { Block } from '@/api/generated/api'

interface Props {
    block: Block
    depth?: number
    maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
    depth: 0,
    maxDepth: 10
})
</script>

<style scoped lang="scss">
.column-content {
    // 컬럼 내부 콘텐츠 스타일링
    width: 100%;

    // 컬럼 내부의 이미지가 부모 너비를 넘지 않도록 보장
    :deep(img) {
        max-width: 100% !important;
        height: auto !important;
        width: 100% !important;
    }

    // 컬럼 내부의 이미지 블록 컨테이너
    :deep(.async-image-block) {
        width: 100%;

        img {
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
        }

        // 이미지 캡션 스타일링
        .image-caption {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: #6c757d;
            text-align: center;
            font-style: italic;
        }
    }

    // 텍스트 블록들의 여백 조정
    :deep(.text-block-item) {
        margin-bottom: 0.75rem;

        &:last-child {
            margin-bottom: 0;
        }
    }

    // 코드 블록의 여백 조정
    :deep(.code-block-item) {
        margin: 1rem 0;

        &:last-child {
            margin-bottom: 0;
        }
    }

    // 테이블 블록의 여백 조정
    :deep(.table-block-item) {
        margin: 1rem 0;

        &:last-child {
            margin-bottom: 0;
        }

        // 테이블이 컬럼 너비에 맞게 조정
        table {
            width: 100%;
            font-size: 0.875rem;
        }
    }

    // 파일/URL 블록들의 여백 조정
    :deep(.file-block-item),
    :deep(.url-block-item) {
        margin: 0.75rem 0;

        &:last-child {
            margin-bottom: 0;
        }
    }

    // 헤딩 블록들의 여백 조정 (컬럼 내에서는 더 작게)
    :deep(.heading-block) {
        margin: 1rem 0 0.5rem 0;

        &:first-child {
            margin-top: 0;
        }

        &:last-child {
            margin-bottom: 0;
        }
    }

    // 인용문 블록의 스타일 조정
    :deep(.quote-block) {
        margin: 0.75rem 0;
        padding: 0.75rem;
        border-left: 3px solid #e9ecef;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 0 4px 4px 0;
        font-size: 0.95rem;

        &:last-child {
            margin-bottom: 0;
        }
    }

    // 콜아웃 블록의 스타일 조정
    :deep(.callout-block) {
        margin: 0.75rem 0;
        padding: 0.75rem;
        border-left: 3px solid #0dcaf0;
        background: rgba(13, 202, 240, 0.05);
        border-radius: 0 4px 4px 0;
        font-size: 0.95rem;

        &:last-child {
            margin-bottom: 0;
        }
    }

    // 리스트 블록들의 여백 조정
    :deep(.list-block) {
        margin: 0.5rem 0;

        &:last-child {
            margin-bottom: 0;
        }

        ul,
        ol {
            padding-left: 1.25rem;

            li {
                margin-bottom: 0.25rem;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
}

// 모바일에서의 컬럼 스타일 조정
@media (max-width: 767.98px) {
    .column-content {
        // 모바일에서는 여백을 더 줄임
        :deep(.text-block-item) {
            margin-bottom: 0.5rem;
        }

        :deep(.code-block-item),
        :deep(.table-block-item) {
            margin: 0.75rem 0;
        }

        :deep(.quote-block),
        :deep(.callout-block) {
            margin: 0.5rem 0;
            padding: 0.5rem;
        }
    }
}

// 태블릿에서의 스타일 조정
@media (min-width: 768px) and (max-width: 991.98px) {
    .column-content {
        :deep(.table-block-item) {
            table {
                font-size: 0.8rem;
            }
        }
    }
}

// 다크 모드 지원
@media (prefers-color-scheme: dark) {
    .column-content {
        :deep(.quote-block) {
            background: rgba(255, 255, 255, 0.02);
            border-left-color: #495057;
        }

        :deep(.callout-block) {
            background: rgba(13, 202, 240, 0.08);
        }

        :deep(.image-caption) {
            color: #adb5bd;
        }
    }
}

// 인쇄 시 스타일
@media print {
    .column-content {
        // 인쇄 시 여백 최소화
        :deep(.text-block-item),
        :deep(.code-block-item),
        :deep(.table-block-item),
        :deep(.file-block-item),
        :deep(.url-block-item),
        :deep(.quote-block),
        :deep(.callout-block) {
            margin: 0.25rem 0;
        }

        :deep(.heading-block) {
            margin: 0.5rem 0 0.25rem 0;
        }
    }
}
</style>
