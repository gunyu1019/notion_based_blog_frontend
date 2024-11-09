import type { Ref } from 'vue'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import Client from '@/api/client'
import type PostItemDetail from '@/types/PostItemDetail'

export const usePostItemDetailStore = defineStore('PostItemDetail', () => {
    const content: Ref<PostItemDetail | undefined> = ref(undefined)

    async function fetchContent(post_id: string) {
        const client = new Client()
        content.value = await client.getPost(post_id)
    }

    return { content, fetchContent }
})
