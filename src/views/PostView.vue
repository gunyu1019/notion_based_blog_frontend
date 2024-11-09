<script lang="ts" setup>
import Wave from '@/components/WaveItem.vue'
import { onMounted } from 'vue';
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
    console.log(route.query)
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
