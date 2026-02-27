import type { Ref } from 'vue'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { type Category } from '@/api'

export const useCategoryStore = defineStore('category', () => {
    const categories: Ref<Category[]> = ref([])
    const selectedCategory: Ref<string | null> = ref(null)

    // 실제 API에서 카테고리를 가져오는 함수가 없으므로,
    // 게시글에서 카테고리를 추출하는 방식으로 구현
    function extractCategoriesFromPosts(posts: any[]) {
        const categorySet = new Set<string>()
        const categoryMap = new Map<string, Category>()

        posts.forEach((post) => {
            if (post.category && Array.isArray(post.category)) {
                post.category.forEach((cat: Category) => {
                    if (!categorySet.has(cat.id)) {
                        categorySet.add(cat.id)
                        categoryMap.set(cat.id, cat)
                    }
                })
            }
        })

        categories.value = Array.from(categoryMap.values())
    }

    function setSelectedCategory(categoryId: string | null) {
        selectedCategory.value = categoryId
    }

    // 임시적으로 빈 함수로 구현 (실제로는 게시글에서 추출)
    function fetchCategories() {
        // 이 함수는 HomeView에서 게시글을 불러온 후에 호출될 예정
    }

    return {
        categories,
        selectedCategory,
        setSelectedCategory,
        fetchCategories,
        extractCategoriesFromPosts
    }
})
