import type { Ref } from 'vue'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { extendedApi, type PostItem } from '@/api'

export const usePostItemStore = defineStore('postItem', () => {
    const content: Ref<PostItem[]> = ref([])
    const loading: Ref<boolean> = ref(false)
    const error: Ref<string | null> = ref(null)

    async function fetchContent(privateAccess: boolean = false) {
        loading.value = true
        error.value = null

        try {
            const response = await extendedApi.getPosts({ private_access: privateAccess })
            content.value = response.data
        } catch (err) {
            error.value =
                err instanceof Error ? err.message : '게시글 목록을 불러오는데 실패했습니다.'
            console.error('Failed to fetch posts:', err)
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
