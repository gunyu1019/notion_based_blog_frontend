import type { Ref } from 'vue'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { blogApi, type PostItemDetail } from '@/api'

export const usePostItemDetailStore = defineStore('PostItemDetail', () => {
    const content: Ref<PostItemDetail | undefined> = ref(undefined)
    const loading: Ref<boolean> = ref(false)
    const error: Ref<string | null> = ref(null)

    async function fetchContent(post_id: string) {
        loading.value = true
        error.value = null

        try {
            const response = await blogApi.postInfoPostGet(post_id)
            content.value = response.data
        } catch (err) {
            error.value = err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다.'
            console.error('Failed to fetch post detail:', err)
        } finally {
            loading.value = false
        }
    }

    return {
        content,
        loading,
        error,
        fetchContent
    }
})
