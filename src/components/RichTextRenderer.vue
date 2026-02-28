<template>
    <template v-for="(richText, index) in richTexts" :key="index">
        <a
            v-if="richText.href"
            :href="richText.href"
            :class="getRichTextClasses(richText)"
            target="_blank"
            rel="noopener noreferrer"
        >
            {{ richText.text }}
        </a>
        <code
            v-else-if="richText.code"
            class="bg-light text-dark px-1 rounded"
            :class="getRichTextClasses(richText)"
        >
            {{ richText.text }}
        </code>
        <span v-else :class="getRichTextClasses(richText)">
            {{ richText.text }}
        </span>
    </template>
</template>

<script setup lang="ts">
import type { RichText } from '@/api/generated/api'

interface Props {
    richTexts: RichText[]
}

defineProps<Props>()

/**
 * RichText 속성에 따른 Bootstrap 5 클래스 생성
 */
const getRichTextClasses = (richText: RichText): string => {
    const classes: string[] = []

    if (richText.bold) {
        classes.push('fw-bold')
    }

    if (richText.italic) {
        classes.push('fst-italic')
    }

    if (richText.underline) {
        classes.push('text-decoration-underline')
    }

    if (richText.strikethrough) {
        classes.push('text-decoration-line-through')
    }

    return classes.join(' ')
}
</script>

<style scoped>
/* 추가 커스텀 스타일이 필요한 경우 */
code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875em;
}

a {
    color: #0066cc;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>
