<script lang="ts" setup>
import Wave from '@/components/WaveItem.vue'
import router from '@/router';
import { usePostItemDetailStore } from '@/stores/postItemDetail';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router'

const route = useRoute()
const postItemStore = usePostItemDetailStore()
const { content } = storeToRefs(postItemStore)

onMounted(() => {
    if (route.query.post_id === undefined) {
        router.push('home')
    }
    postItemStore.fetchContent(route.query.post_id as string)
})
</script>

<template>
    <div class="wrapper"></div>
    <Wave type="1" />
    <div class="wrapper" style="background: #373b3e"></div>
</template>

<style lang="scss" scoped>
div.wrapper {
    padding: 100px 0;
}
</style>
