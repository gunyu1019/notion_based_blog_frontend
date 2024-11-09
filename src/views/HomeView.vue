<script lang="ts" setup>
import { usePostItemStore } from '@/stores/postItem'
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Wave from '@/components/WaveItem.vue'

const postItemStore = usePostItemStore()
const { content } = storeToRefs(postItemStore)
onMounted(() => {
    postItemStore.fetchContent()
})
</script>

<template>
    <div class="wrapper"></div>
    <Wave type="1" />
    <div class="wrapper" style="background: #373b3e"></div>
</template>

<style lang="scss" scoped>
div.wrapper {
    padding: 200px 0;
}
</style>
