<template>
    <div class="text-block-item" :class="`text-block-${block.type}`">
        <!-- Heading 블록들 -->
        <h1 v-if="block.type === 'heading_1'" class="mb-3 text-block-heading">
            <RichTextRenderer :rich-texts="block.text || []" />
        </h1>

        <h2 v-else-if="block.type === 'heading_2'" class="mb-3 text-block-heading">
            <RichTextRenderer :rich-texts="block.text || []" />
        </h2>

        <h3 v-else-if="block.type === 'heading_3'" class="mb-3 text-block-heading">
            <RichTextRenderer :rich-texts="block.text || []" />
        </h3>

        <h4 v-else-if="block.type === 'heading_4'" class="mb-3 text-block-heading">
            <RichTextRenderer :rich-texts="block.text || []" />
        </h4>

        <h5 v-else-if="block.type === 'heading_5'" class="mb-3 text-block-heading">
            <RichTextRenderer :rich-texts="block.text || []" />
        </h5>

        <h6 v-else-if="block.type === 'heading_6'" class="mb-3 text-block-heading">
            <RichTextRenderer :rich-texts="block.text || []" />
        </h6>

        <!-- 리스트 블록들 -->
        <div v-else-if="block.type === 'bulleted_list_item'" class="mb-2 bulleted-list">
            <ul class="mb-0">
                <li>
                    <RichTextRenderer :rich-texts="block.text || []" />
                </li>
            </ul>
        </div>

        <div v-else-if="block.type === 'numbered_list_item'" class="mb-2 numbered-list">
            <ol class="mb-0">
                <li>
                    <RichTextRenderer :rich-texts="block.text || []" />
                </li>
            </ol>
        </div>

        <!-- Quote 블록 -->
        <blockquote
            v-else-if="block.type === 'quote'"
            class="blockquote border-start border-4 border-secondary ps-3 mb-4"
        >
            <p class="mb-0">
                <RichTextRenderer :rich-texts="block.text || []" />
            </p>
        </blockquote>

        <!-- Callout 블록 -->
        <div v-else-if="block.type === 'callout'" class="alert alert-info mb-4 callout-block">
            <div class="d-flex align-items-start">
                <i class="fas fa-info-circle me-2 mt-1 callout-icon"></i>
                <div class="flex-grow-1">
                    <RichTextRenderer :rich-texts="block.text || []" />
                </div>
            </div>
        </div>

        <!-- 구분선 -->
        <hr v-else-if="block.type === 'divider'" class="my-4" />

        <!-- 토글 블록 -->
        <div v-else-if="block.type === 'toggle'" class="toggle-block mb-3">
            <button
                @click="toggleExpanded"
                class="btn btn-outline-secondary btn-sm mb-2 d-flex align-items-center"
                type="button"
            >
                <i
                    :class="isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"
                    class="me-2"
                ></i>
                <RichTextRenderer :rich-texts="block.text || []" />
            </button>
            <div v-show="isExpanded" class="toggle-content ps-3">
                <!-- 하위 컨텐츠는 부모에서 처리됨 -->
            </div>
        </div>

        <!-- 이미지 블록 -->
        <div v-else-if="block.type === 'image'" class="mb-4 text-center image-block">
            <img
                v-if="getImageUrl()"
                :src="getImageUrl()"
                class="img-fluid rounded shadow-sm"
                :alt="getImageAlt()"
                loading="lazy"
            />
            <div v-if="block.captions && block.captions.length > 0" class="text-muted small mt-2">
                <RichTextRenderer :rich-texts="block.captions" />
            </div>
        </div>

        <!-- 일반 문단 (paragraph) 및 기타 텍스트 블록 -->
        <div v-else class="mb-3 paragraph-block">
            <p class="mb-0" :class="{ 'text-muted': block.text && block.text.length === 0 }">
                <RichTextRenderer
                    :rich-texts="block.text || []"
                    v-if="block.text && block.text.length > 0"
                />
                <span v-else class="empty-paragraph">&nbsp;</span>
            </p>
        </div>

        <!-- 캡션 -->
        <div v-if="hasCaption && !isImageOrFileBlock" class="text-muted small mt-1 block-caption">
            <RichTextRenderer :rich-texts="block.captions!" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import RichTextRenderer from '@/components/RichTextRenderer.vue'
import type { Block } from '@/api/generated/api'

interface Props {
    block: Block
}

const props = defineProps<Props>()

// 토글 상태 관리
const isExpanded = ref(false)

/**
 * 토글 상태 변경
 */
const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value
}

/**
 * 캡션 존재 여부
 */
const hasCaption = computed((): boolean => {
    return Boolean(props.block.captions && props.block.captions.length > 0)
})

/**
 * 이미지나 파일 블록인지 확인 (캡션 중복 방지)
 */
const isImageOrFileBlock = computed((): boolean => {
    return ['image', 'file'].includes(props.block.type)
})

/**
 * 이미지 URL 추출
 */
const getImageUrl = (): string => {
    if ('file' in props.block && props.block.file && typeof props.block.file === 'object') {
        const fileObj = props.block.file as { url?: string }
        return fileObj.url || ''
    }
    return ''
}

/**
 * 이미지 alt 텍스트 생성
 */
const getImageAlt = (): string => {
    if (props.block.captions && props.block.captions.length > 0) {
        return props.block.captions.map((c) => c.text).join('')
    }
    return '이미지'
}
</script>

<style scoped lang="scss">
.text-block-item {
    font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, 'Apple Color Emoji', Arial,
        sans-serif, 'Segoe UI Emoji', 'Segoe UI Symbol';
    line-height: 1.6;
}

.text-block-heading {
    font-weight: 600;
    margin-top: 2rem;

    &:first-child {
        margin-top: 0;
    }
}

.bulleted-list,
.numbered-list {
    ul,
    ol {
        padding-left: 1.5rem;
        margin-bottom: 0;
    }

    li {
        margin-bottom: 0.25rem;
    }
}

.blockquote {
    font-style: italic;
    color: #6c757d;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 0 8px 8px 0;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
}

.callout-block {
    border: 1px solid rgba(13, 202, 240, 0.2);
    border-left: 4px solid #0dcaf0;
    background-color: rgba(13, 202, 240, 0.05);

    .callout-icon {
        color: #0dcaf0;
        font-size: 1.1em;
    }
}

.toggle-block {
    .btn {
        border-style: dashed;
        text-align: left;

        &:focus {
            box-shadow: none;
        }
    }

    .toggle-content {
        border-left: 2px solid #e9ecef;
        padding-left: 1rem;
        margin-left: 0.5rem;
    }
}

.image-block {
    img {
        max-width: 100%;
        height: auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}

.paragraph-block {
    .empty-paragraph {
        min-height: 1.5rem;
        display: inline-block;
    }
}

.block-caption {
    font-style: italic;
    margin-top: 0.5rem;
    padding-left: 0.5rem;
    border-left: 2px solid #e9ecef;
}

// 반응형 디자인
@media (max-width: 768px) {
    .text-block-heading {
        margin-top: 1.5rem;
    }

    .blockquote {
        padding: 0.75rem 1rem;
        margin: 1rem 0;
    }

    .callout-block {
        padding: 0.75rem;
    }
}

// 다크 모드 지원 (선택사항)
@media (prefers-color-scheme: dark) {
    .blockquote {
        background-color: rgba(255, 255, 255, 0.05);
        color: #adb5bd;
    }

    .block-caption {
        border-left-color: #495057;
    }
}
</style>
