<script lang="ts" setup>
import type RichText from '@/types/rich_text/RichText'

defineProps<{
    richText: RichText
}>()
</script>

<template>
    <a v-if="richText.href !== null" v-bind:href="richText.href as string">
        <span
            v-bind:style="{
                textDecoration: `${richText.underline === true ? 'underline' : ''}
                    ${richText.strikethrough === true ? 'line-through' : ''}`,
                fontWeight: richText.bold === true ? 'bold' : 'undefined',
                fontStyle: richText.italic ? 'italic' : 'normal',
                color: richText.color ?? 'undefined'
            }"
            >{{ richText.text }}</span
        >
    </a>
    <span
        v-else
        v-bind:style="{
            textDecoration: `${richText.underline === true ? 'underline' : ''}
                ${richText.strikethrough === true ? 'line-through' : ''}`,
            fontWeight: richText.bold === true ? 'bold' : 'undefined',
            fontStyle: richText.italic ? 'italic' : 'normal',
            color: richText.color ?? 'undefined'
        }"
        >{{ richText.text }}</span
    >
</template>

<style scoped></style>
