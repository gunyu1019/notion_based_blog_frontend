<script lang="ts" setup>
import type RichText from '@/types/RichText'

defineProps<{
    richText: RichText
}>()
</script>

<template>
    <a v-if="richText.href !== null" v-bind:href="richText.href">
        <span
            v-bind:style="{
                textDecoration: `${richText.underline === true ? 'underline' : ''}
                ${richText.strikethrough === true ? 'line-through' : ''}`,
                fontWeight: richText.bold === true ? 'bold' : null,
                fontStyle: richText.italic ? 'italic' : 'normal',
                color: richText.color
            }"
            >{{ richText.text }}</span
        >
    </a>
    <span
        v-else
        v-bind:style="{
            textDecoration: `${richText.underline === true ? 'underline' : ''}
                ${richText.strikethrough === true ? 'line-through' : ''}`,
            fontWeight: richText.bold === true ? 'bold' : null,
            fontStyle: richText.italic ? 'italic' : 'normal',
            color: richText.color
        }"
        >{{ richText.text }}</span
    >
</template>

<style scoped></style>
