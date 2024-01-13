<script lang="ts" setup>
import { usePostItemStore } from '@/stores/postItem'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

const postItemStore = usePostItemStore()
const { content } = storeToRefs(postItemStore)
onMounted(() => {
    postItemStore.fetchContent()
})
</script>

<template>
    <div>
        <ul>
            <li v-for="item in content">{{ item.title }}</li>
        </ul>
    </div>
</template>
