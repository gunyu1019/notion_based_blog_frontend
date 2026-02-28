<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
    // 기존 쿼리 파라미터 방식에서 새로운 라우트 파라미터 방식으로 리다이렉트
    if (route.query.post_id) {
        router.replace(`/post/${route.query.post_id}`)
    } else {
        router.replace('/')
    }
})
</script>

<template>
    <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">페이지를 이동하는 중...</span>
        </div>
    </div>
</template>
