import type { Ref } from 'vue'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type PostItem from '@/types/PostItem'
import Client from '@/api/client'

export const usePostItemStore = defineStore('PostItem', () => {
    const content: Ref<PostItem[]> = ref([])

    async function fetchContent() {
        const client = new Client()
        content.value = await client.getPosts()
    }

    return { content, fetchContent }
})
