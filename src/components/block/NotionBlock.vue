<template>
    <div class="notion-block-dispatcher" :class="`block-type-${block.type}`">
        <!-- 동적 컴포넌트 렌더링 -->
        <component :is="dynamicComponent" v-bind="componentProps" :key="block.id" />

        <!-- 재귀적 하위 블록 렌더링 -->
        <div v-if="hasChildren" class="block-children" :class="getChildrenContainerClass()">
            <NotionBlock
                v-for="child in block.children"
                :key="child.id"
                :block="child"
                :depth="currentDepth + 1"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { Component } from 'vue'
import type { Block, CodeBlock, TableBlock, UrlBlock, FileBlock } from '@/api/generated/api'

// 컴포넌트들을 동적으로 import (코드 스플리팅을 위한 lazy loading)
const TextBlockItem = defineAsyncComponent(() => import('./TextBlockItem.vue'))
const CodeBlockItem = defineAsyncComponent(() => import('./CodeBlockItem.vue'))
const TableBlockItem = defineAsyncComponent(() => import('./TableBlockItem.vue'))
const UrlBlockItem = defineAsyncComponent(() => import('./UrlBlockItem.vue'))
const FileBlockItem = defineAsyncComponent(() => import('./FileBlockItem.vue'))
const AsyncImageBlockItem = defineAsyncComponent(() => import('./AsyncImageBlockItem.vue'))
const ColumnListBlockItem = defineAsyncComponent(() => import('./ColumnListBlockItem.vue'))
const ColumnBlockItem = defineAsyncComponent(() => import('./ColumnBlockItem.vue'))

interface Props {
    block: Block | CodeBlock | TableBlock | UrlBlock | FileBlock
    depth?: number
    maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
    depth: 0,
    maxDepth: 10
})

/**
 * 현재 블록의 깊이
 */
const currentDepth = computed((): number => {
    return Math.max(0, props.depth)
})

/**
 * 하위 블록이 있는지 확인
 * column_list와 column 타입은 내부에서 자체적으로 children을 렌더링하므로 제외
 */
const hasChildren = computed((): boolean => {
    // column_list와 column 타입은 내부에서 자체 렌더링하므로 여기서 children 렌더링 안 함
    if (props.block.type === 'column_list' || props.block.type === 'column') {
        return false
    }

    return Boolean(
        props.block.has_children &&
        props.block.children &&
        props.block.children.length > 0 &&
        currentDepth.value < props.maxDepth
    )
})

/**
 * 블록 타입에 따른 컴포넌트 매핑
 */
const componentMapping: Record<string, Component> = {
    // 텍스트 관련 블록들
    paragraph: TextBlockItem,
    heading_1: TextBlockItem,
    heading_2: TextBlockItem,
    heading_3: TextBlockItem,
    heading_4: TextBlockItem,
    heading_5: TextBlockItem,
    heading_6: TextBlockItem,
    bulleted_list_item: TextBlockItem,
    numbered_list_item: TextBlockItem,
    quote: TextBlockItem,
    callout: TextBlockItem,
    toggle: TextBlockItem,
    divider: TextBlockItem,

    // 이미지 블록 - 비동기 CDN URL 로딩
    image: AsyncImageBlockItem,

    // 컬럼 레이아웃 블록들
    column_list: ColumnListBlockItem,
    column: ColumnBlockItem,

    // 전용 컴포넌트가 있는 블록들
    code: CodeBlockItem,
    table: TableBlockItem,
    bookmark: UrlBlockItem,
    link_preview: UrlBlockItem,
    url: UrlBlockItem,
    file: FileBlockItem,
    video: FileBlockItem,
    audio: FileBlockItem
}

/**
 * 동적으로 렌더링할 컴포넌트 결정
 */
const dynamicComponent = computed((): Component => {
    const blockType = props.block.type
    const component = componentMapping[blockType]

    if (!component) {
        console.warn(`Unknown block type: ${blockType}, falling back to TextBlockItem`)
        return TextBlockItem
    }

    return component
})

/**
 * 컴포넌트에 전달할 props 생성
 */
const componentProps = computed(() => {
    const blockType = props.block.type

    // 각 컴포넌트별로 적절한 prop 이름으로 매핑
    switch (blockType) {
        case 'image':
            return {
                blockId: props.block.id
            }

        case 'column_list':
        case 'column':
            return {
                block: props.block as Block,
                depth: currentDepth.value,
                maxDepth: props.maxDepth
            }

        case 'code':
            return {
                codeBlock: props.block as CodeBlock
            }

        case 'table':
            return {
                tableBlock: props.block as TableBlock
            }

        case 'bookmark':
        case 'link_preview':
        case 'url':
            return {
                urlBlock: props.block as UrlBlock
            }

        case 'file':
        case 'video':
        case 'audio':
            return {
                fileBlock: props.block as FileBlock
            }

        default:
            // TextBlockItem의 경우
            return {
                block: props.block as Block
            }
    }
})

/**
 * 하위 컨테이너 CSS 클래스 생성
 */
const getChildrenContainerClass = (): string => {
    const classes: string[] = ['notion-children']

    // 깊이별 들여쓰기
    classes.push(`depth-${currentDepth.value}`)

    // 블록 타입에 따른 특별한 스타일링
    switch (props.block.type) {
        case 'quote':
            classes.push('children-quote')
            break
        case 'callout':
            classes.push('children-callout')
            break
        case 'toggle':
            classes.push('children-toggle')
            break
        case 'bulleted_list_item':
        case 'numbered_list_item':
            classes.push('children-list')
            break
        default:
            classes.push('children-default')
    }

    return classes.join(' ')
}
</script>

<style scoped lang="scss">
.notion-block-dispatcher {
    position: relative;

    // 최상위 블록 여백
    &:not(:first-child) {
        margin-top: 0.5rem;
    }

    &:not(:last-child) {
        margin-bottom: 0.5rem;
    }
}

.block-children {
    position: relative;

    // 기본 들여쓰기
    &.notion-children {
        margin-left: 1.5rem;
        margin-top: 0.5rem;

        // 깊이별 들여쓰기 조정
        &.depth-0 {
            margin-left: 1.5rem;
        }
        &.depth-1 {
            margin-left: 1.25rem;
        }
        &.depth-2 {
            margin-left: 1rem;
        }
        &.depth-3 {
            margin-left: 0.75rem;
        }
        &.depth-4 {
            margin-left: 0.5rem;
        }

        // 깊이가 깊어질수록 들여쓰기 줄이기 (과도한 중첩 방지)
        &.depth-5,
        &.depth-6,
        &.depth-7,
        &.depth-8,
        &.depth-9 {
            margin-left: 0.25rem;
        }
    }

    // 인용문 하위 요소들
    &.children-quote {
        padding-left: 1rem;
        border-left: 3px solid #e9ecef;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 0 4px 4px 0;
    }

    // 콜아웃 하위 요소들
    &.children-callout {
        padding: 0.5rem 0 0.5rem 1rem;
        border-left: 2px solid #0dcaf0;
        background: rgba(13, 202, 240, 0.03);
    }

    // 토글 하위 요소들
    &.children-toggle {
        padding-left: 1rem;
        border-left: 2px dashed #dee2e6;
        position: relative;

        &::before {
            content: '';
            position: absolute;
            left: -1px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, #dee2e6 0%, transparent 100%);
        }
    }

    // 리스트 하위 요소들
    &.children-list {
        margin-left: 2rem; // 리스트는 조금 더 들여쓰기
    }

    // 기본 하위 요소들
    &.children-default {
        padding-left: 0.5rem;
        border-left: 1px solid #f1f3f4;
    }
}

// 블록 타입별 특별한 스타일링
.block-type-heading_1,
.block-type-heading_2,
.block-type-heading_3 {
    margin: 2rem 0 1rem 0;

    &:first-child {
        margin-top: 0;
    }
}

.block-type-divider {
    margin: 2rem 0;
}

.block-type-code,
.block-type-table,
.block-type-file,
.block-type-bookmark,
.block-type-link_preview {
    margin: 1.5rem 0;
}

// 반응형 디자인
@media (max-width: 768px) {
    .block-children {
        &.notion-children {
            margin-left: 1rem;

            &.depth-0 {
                margin-left: 1rem;
            }
            &.depth-1 {
                margin-left: 0.75rem;
            }
            &.depth-2 {
                margin-left: 0.5rem;
            }
            &.depth-3,
            &.depth-4,
            &.depth-5,
            &.depth-6,
            &.depth-7,
            &.depth-8,
            &.depth-9 {
                margin-left: 0.25rem;
            }
        }

        &.children-quote,
        &.children-callout,
        &.children-toggle {
            padding-left: 0.5rem;
        }

        &.children-list {
            margin-left: 1.5rem;
        }
    }
}

// 다크 모드 지원
@media (prefers-color-scheme: dark) {
    .block-children {
        &.children-quote {
            background: rgba(255, 255, 255, 0.02);
            border-left-color: #495057;
        }

        &.children-callout {
            background: rgba(13, 202, 240, 0.08);
        }

        &.children-toggle {
            border-left-color: #495057;

            &::before {
                background: linear-gradient(to bottom, #495057 0%, transparent 100%);
            }
        }

        &.children-default {
            border-left-color: #343a40;
        }
    }
}

// 인쇄 시 스타일
@media print {
    .block-children {
        &.notion-children {
            margin-left: 1rem;
        }

        &.children-quote,
        &.children-callout,
        &.children-toggle,
        &.children-default {
            border-left-color: #000;
            background: transparent;
        }
    }
}

// 최대 깊이 경고 스타일
.notion-block-dispatcher[data-max-depth-reached='true'] {
    .block-children {
        &::after {
            content: '⚠️ 최대 중첩 깊이에 도달했습니다.';
            display: block;
            color: #dc3545;
            font-size: 0.875rem;
            font-style: italic;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
        }
    }
}

// 로딩 상태 스타일 (동적 컴포넌트 로딩 중)
.notion-block-dispatcher {
    &:has(.loading-placeholder) {
        .loading-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 3rem;
            color: #6c757d;
            font-size: 0.875rem;

            .spinner-border {
                width: 1rem;
                height: 1rem;
                margin-right: 0.5rem;
            }
        }
    }
}

// 에러 상태 스타일
.component-error {
    padding: 1rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    color: #721c24;
    margin: 0.5rem 0;

    .error-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .error-message {
        font-size: 0.875rem;
        opacity: 0.8;
    }
}
</style>
