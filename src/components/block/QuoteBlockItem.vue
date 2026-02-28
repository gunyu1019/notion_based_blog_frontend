<template>
    <!-- 단일 최상위 래퍼 (Single Quote Container) -->
    <blockquote
        class="quote-wrapper border-start border-4 border-secondary ps-3 py-3 my-4 bg-light rounded-end"
    >
        <!-- 첫 번째 영역: 메인 텍스트 (block.text 배열) -->
        <div v-if="props.block.text && props.block.text.length > 0" class="quote-main-text mb-3">
            <RichTextRenderer :richTexts="props.block.text" />
        </div>

        <!-- 두 번째 영역: 자식 블록들 (block.children 배열) -->
        <div
            v-if="
                props.block.has_children && props.block.children && props.block.children.length > 0
            "
            class="quote-children"
        >
            <NotionBlock
                v-for="child in props.block.children"
                :key="child.id"
                :block="child"
                :depth="(props.depth || 0) + 1"
                :maxDepth="props.maxDepth"
            />
        </div>
    </blockquote>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { Block } from '@/api/generated/api'

// 컴포넌트 import
import RichTextRenderer from '@/components/RichTextRenderer.vue'
const NotionBlock = defineAsyncComponent(() => import('./NotionBlock.vue'))

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

<style scoped>
.quote-wrapper {
    /* 인용구의 기본 스타일은 Bootstrap 클래스로 처리 */
    font-style: italic;
    position: relative;
}

/* 자식 블록들에는 인용구 스타일이 상속되지 않도록 설정 */
.quote-children {
    font-style: normal;
    margin-top: 0.75rem;
}

/* 중첩된 인용구의 경우 추가 스타일링 방지 */
.quote-children .quote-wrapper {
    border-left-width: 2px;
    padding-left: 1rem;
    background-color: transparent;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
    .quote-wrapper {
        background-color: rgba(108, 117, 125, 0.1) !important;
        border-color: #6c757d !important;
    }
}

/* 모바일 반응형 */
@media (max-width: 767.98px) {
    .quote-wrapper {
        padding-left: 1rem;
        margin: 1rem 0;
    }
}
</style>
