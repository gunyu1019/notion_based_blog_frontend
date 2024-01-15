<script lang="ts" setup>
import { usePostItemStore } from '@/stores/postItem'
import { onMounted, Ref, ref } from 'vue'
import { storeToRefs } from 'pinia'
import PostList from '@/components/PostList.vue'

const postItemStore = usePostItemStore()
const { content } = storeToRefs(postItemStore)
onMounted(() => {
    postItemStore.fetchContent()
})
</script>

<template>
    <div class="container wrapper">
        <div class="post-card-group">
            <PostList :content="content" title="최신글" title-icon="clock" />
            <PostList :content="content" title="인기글" title-icon="arrow-trend-up" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
div.wrapper {
    padding: 200px 0;

    div.post-card-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 20px;
    }
}
</style>
