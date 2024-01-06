<script setup lang="ts">
import StyledText from '@/components/StyledText.vue'
import type RichText from '@/types/RichText'

const richText: RichText = {
    text: '안녕세상?',
    href: 'https://yhs.kr',
    strikethrough: false,
    underline: false,
    bold: false,
    color: 'white'
}
</script>

<template>
    <main>
        <StyledText :rich-text="richText" />
    </main>
</template>
