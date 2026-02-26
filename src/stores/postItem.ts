import type { Ref } from 'vue'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type PostItem from '@/types/PostItem'
// import Client from '@/api/client'

export const usePostItemStore = defineStore('PostItem', () => {
    const content: Ref<PostItem[]> = ref([])

    async function fetchContent() {
        // const client = new Client()
        // content.value = await client.getPosts()

        // 임시 더미 데이터 (실제로는 API에서 가져옴)
        content.value = [
            {
                id: '1' as string,
                title: 'Vue 3 Composition API 완벽 가이드' as string,
                published_at: new Date('2024-01-15'),
                thumbnail_url: 'https://via.placeholder.com/400x200/4F46E5/ffffff?text=Vue+3' as string,
                hits: BigInt(1250),
                category: [
                    { id: '1' as string, name: 'Web Development' as string },
                    { id: '2' as string, name: 'Vue.js' as string }
                ]
            },
            {
                id: '2' as string,
                title: 'TypeScript와 함께하는 모던 웹 개발' as string,
                published_at: new Date('2024-01-10'),
                thumbnail_url: 'https://via.placeholder.com/400x200/3B82F6/ffffff?text=TypeScript' as string,
                hits: BigInt(980),
                category: [
                    { id: '1' as string, name: 'Web Development' as string },
                    { id: '3' as string, name: 'TypeScript' as string }
                ]
            },
            {
                id: '3' as string,
                title: 'React vs Vue: 2024년 프론트엔드 프레임워크 비교' as string,
                published_at: new Date('2024-01-05'),
                thumbnail_url: 'https://via.placeholder.com/400x200/10B981/ffffff?text=React+vs+Vue' as string,
                hits: BigInt(2150),
                category: [
                    { id: '1' as string, name: 'Web Development' as string },
                    { id: '4' as string, name: 'React' as string }
                ]
            },
            {
                id: '4' as string,
                title: 'Vite로 빠른 개발 환경 구축하기' as string,
                published_at: new Date('2023-12-28'),
                thumbnail_url: 'https://via.placeholder.com/400x200/8B5CF6/ffffff?text=Vite' as string,
                hits: BigInt(756),
                category: [
                    { id: '1' as string, name: 'Web Development' as string },
                    { id: '3' as string, name: 'DevOps' as string }
                ]
            },
            {
                id: '5' as string,
                title: 'CSS Grid vs Flexbox: 언제 무엇을 사용할까?' as string,
                published_at: new Date('2023-12-20'),
                thumbnail_url: 'https://via.placeholder.com/400x200/F59E0B/ffffff?text=CSS+Grid' as string,
                hits: BigInt(1890),
                category: [
                    { id: '1' as string, name: 'Web Development' as string },
                    { id: '5' as string, name: 'CSS' as string }
                ]
            },
            {
                id: '6' as string,
                title: 'Node.js 백엔드 API 설계 베스트 프랙티스' as string,
                published_at: new Date('2023-12-15'),
                thumbnail_url: 'https://via.placeholder.com/400x200/EF4444/ffffff?text=Node.js' as string,
                hits: BigInt(1345),
                category: [
                    { id: '2' as string, name: 'Backend' as string },
                    { id: '6' as string, name: 'Node.js' as string }
                ]
            }
        ]
    }

    return { content, fetchContent }
})
