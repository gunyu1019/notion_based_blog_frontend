import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import type { Ref } from 'vue'
import type PostItem from '@/types/PostItem'

const baseUrl = '/api'

export const usePostItemStore = defineStore('PostItem', () => {
    const content: Ref<PostItem[]> = ref([])

    async function fetchContent() {
        try {
            const res = await axios.get(baseUrl + '/posts/')
            this.content = res.data
        } catch (err) {
            console.log(err)
        }
    }

    return { content, fetchContent }
})
