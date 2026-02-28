<script lang="ts" setup>
import { usePostItemStore } from '@/stores/postItem'
import { useCategoryStore } from '@/stores/category'
import { onMounted, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import Wave from '@/components/WaveItem.vue'
import HeaderNavbar from '@/components/HeaderNavbar.vue'
import { BDropdown, BDropdownItem } from 'bootstrap-vue-next'

// 라우터 초기화
const router = useRouter()

// 스토어 초기화
const postItemStore = usePostItemStore()
const categoryStore = useCategoryStore()
const { content } = storeToRefs(postItemStore)

// 상태 관리 (State)
const selectedCategory = ref<string | null>(null)
const sortOption = ref<'latest' | 'popular'>('latest')
const displayLimit = ref<number>(5)

// 카테고리 추출 (Computed)
const uniqueCategories = computed(() => {
    const categoryMap = new Map()
    content.value.forEach(post => {
        post.category?.forEach(cat => {
            if (!categoryMap.has(cat.id)) {
                categoryMap.set(cat.id, cat)
            }
        })
    })
    return Array.from(categoryMap.values())
})

// 필터링 및 정렬된 게시글 목록 (Computed)
const filteredAndSortedPosts = computed(() => {
    let filtered = content.value

    // 카테고리 필터링
    if (selectedCategory.value && selectedCategory.value !== '전체') {
        filtered = filtered.filter(
            (post) =>
                post.category && post.category.some((cat) => cat.id === selectedCategory.value)
        )
    }

    // 고도화된 정렬 알고리즘
    if (sortOption.value === 'latest') {
        // 최신순: published_at 또는 last_edited_time 기준 내림차순
        filtered = [...filtered].sort((a, b) => {
            const dateA = a.published_at ? new Date(a.published_at).getTime() : a.last_edited_time ? new Date(a.last_edited_time).getTime() : 0
            const dateB = b.published_at ? new Date(b.published_at).getTime() : b.last_edited_time ? new Date(b.last_edited_time).getTime() : 0
            return dateB - dateA
        })
    } else if (sortOption.value === 'popular') {
        // 인기순: 1차로 hits 내림차순, 2차로 날짜 내림차순 (다중 조건 정렬)
        filtered = [...filtered].sort((a, b) => {
            const hitsA = Number(a.hits || 0)
            const hitsB = Number(b.hits || 0)

            // 1차 정렬: 조회수 비교
            if (hitsA !== hitsB) {
                return hitsB - hitsA
            }

            // 2차 정렬: 조회수가 같으면 날짜로 정렬
            const dateA = a.published_at ? new Date(a.published_at).getTime() : a.last_edited_time ? new Date(a.last_edited_time).getTime() : 0
            const dateB = b.published_at ? new Date(b.published_at).getTime() : b.last_edited_time ? new Date(b.last_edited_time).getTime() : 0
            return dateB - dateA
        })
    }

    return filtered
})

// Top 3 하이라이트 카드 (Computed)
const topPosts = computed(() => {
    return filteredAndSortedPosts.value.slice(0, 3)
})

// 하단 리스트 뷰 (Computed)
const listPosts = computed(() => {
    return filteredAndSortedPosts.value.slice(3, 3 + displayLimit.value)
})

// 더보기 버튼 표시 여부
const showLoadMore = computed(() => {
    return filteredAndSortedPosts.value.length > 3 + displayLimit.value
})

// 날짜 포맷 함수
function formatDate(date: string | null | undefined): string {
    if (!date) return '날짜 없음'
    return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

// 조회수 포맷 함수
function formatViews(views: number | bigint | undefined): string {
    const num = Number(views || 0)
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
}

// 설명 텍스트 자르기
function truncateDescription(description: string | undefined, maxLength: number = 100): string {
    if (!description || description === '미리보기 없음') return ''
    return description.length > maxLength ? description.substring(0, maxLength) + '...' : description
}

// 카테고리 선택 함수
function selectCategory(categoryId: string | null) {
    selectedCategory.value = categoryId
}

// 정렬 옵션 변경 함수
function changeSortOption(option: 'latest' | 'popular') {
    console.log('정렬 옵션 변경:', option) // 디버깅용
    sortOption.value = option
}

// 더보기 버튼 클릭 핸들러
function loadMore() {
    displayLimit.value += 5
}

// 포스트 상세 페이지로 이동하는 함수
function navigateToPost(postId: string) {
    router.push(`/post/${postId}`)
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
    try {
        await postItemStore.fetchContent()
        // 게시글에서 카테고리 추출
        categoryStore.extractCategoriesFromPosts(content.value)
    } catch (error) {
        console.error('Failed to load data:', error)
    }
})
</script>

<template>
    <!-- Header -->
    <HeaderNavbar />

    <!-- Main Content -->
    <div class="home-container">
        <!-- Top Spacing with Wave -->
        <div class="top-spacing">
            <Wave type="1" />
        </div>

        <div class="container-fluid">
            <div class="row justify-content-center">
                <div class="col-12 col-lg-10">

                    <!-- 1. 상단: 필터 및 정렬 바 (Top Section) -->
                    <div class="filter-sort-section d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
                        <!-- 중앙 (카테고리 선택) -->
                        <nav class="category-nav flex-grow-1">
                            <ul class="nav nav-pills justify-content-center justify-content-md-start">
                                <li class="nav-item">
                                    <button
                                        class="nav-link"
                                        :class="{ active: selectedCategory === null }"
                                        @click="selectCategory(null)"
                                    >
                                        전체
                                    </button>
                                </li>
                                <li v-for="category in uniqueCategories" :key="category.id" class="nav-item">
                                    <button
                                        class="nav-link"
                                        :class="{ active: selectedCategory === category.id }"
                                        @click="selectCategory(category.id)"
                                    >
                                        {{ category.name }}
                                    </button>
                                </li>
                            </ul>
                        </nav>

                        <!-- 우측 (정렬 드롭다운) -->
                        <div class="sort-dropdown">
                            <BDropdown
                                variant="outline-secondary"
                                class="dropdown-toggle"
                            >
                                <template #button-content>
                                    <font-awesome-icon :icon="['fas', 'sort']" class="me-2" />
                                    {{ sortOption === 'latest' ? '최신순' : '조회순' }}
                                </template>

                                <BDropdownItem
                                    :active="sortOption === 'latest'"
                                    @click="changeSortOption('latest')"
                                >
                                    <font-awesome-icon :icon="['fas', 'clock']" class="me-2" />
                                    최신순 (등록일)
                                </BDropdownItem>

                                <BDropdownItem
                                    :active="sortOption === 'popular'"
                                    @click="changeSortOption('popular')"
                                >
                                    <font-awesome-icon :icon="['fas', 'eye']" class="me-2" />
                                    조회순 (인기)
                                </BDropdownItem>
                            </BDropdown>
                        </div>
                    </div>

                    <!-- 2. 중앙: Top 3 하이라이트 카드 (Middle Section) -->
                    <section class="highlight-section mb-5" v-if="topPosts.length > 0">
                        <h2 class="section-title mb-4">
                            <font-awesome-icon :icon="['fas', 'star']" class="me-2" />
                            {{ sortOption === 'latest' ? '최신 글' : '인기 글' }}
                        </h2>
                        <div class="row g-4">
                            <div v-for="post in topPosts" :key="post.id" class="col-md-4">

                                <!-- Case A: 썸네일이 있는 경우 -->
                                <div v-if="post.thumbnail_url"
                                     class="card h-100 highlight-card-with-thumbnail"
                                     @click="navigateToPost(post.id)">
                                    <!-- 썸네일 이미지 -->
                                    <div class="card-img-top-wrapper">
                                        <img
                                            :src="post.thumbnail_url"
                                            :alt="post.title"
                                            class="card-img-top"
                                        />
                                    </div>
                                    <div class="card-body">
                                        <!-- 블로그 제목 (fw-bold) -->
                                        <h5 class="card-title">{{ post.title }}</h5>
                                        <!-- 등록일자 및 조회수 -->
                                        <div class="card-meta">
                                            <small class="text-muted">
                                                <i class="far fa-calendar-alt me-1"></i>
                                                {{ formatDate(post.published_at || post.last_edited_time) }}
                                            </small>
                                            <small class="text-muted">
                                                <i class="far fa-eye me-1"></i>
                                                {{ formatViews(post.hits) }}
                                            </small>
                                        </div>
                                        <!-- 카테고리 -->
                                        <div class="card-categories">
                                            <span
                                                v-for="category in post.category"
                                                :key="category.id"
                                                class="badge bg-light text-dark"
                                            >
                                                {{ category.name }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Case B: 썸네일이 없는 경우 -->
                                <div v-else
                                     class="card h-100 highlight-card-no-thumbnail"
                                     @click="navigateToPost(post.id)">
                                    <!-- 블로그 제목 (fw-bold) -->
                                    <h5 class="card-title">{{ post.title }}</h5>
                                    <!-- 블로그 미리보기 글 전체 -->
                                    <p class="card-description" v-if="post.description && post.description !== '미리보기 없음'">
                                        {{ post.description }}
                                    </p>
                                    <!-- 등록일자 및 조회수 -->
                                    <div class="card-meta">
                                        <small class="text-muted">
                                            <i class="far fa-calendar-alt me-1"></i>
                                            {{ formatDate(post.published_at || post.last_edited_time) }}
                                        </small>
                                        <small class="text-muted">
                                            <i class="far fa-eye me-1"></i>
                                            {{ formatViews(post.hits) }}
                                        </small>
                                    </div>
                                    <!-- 카테고리 -->
                                    <div class="card-categories">
                                        <span
                                            v-for="category in post.category"
                                            :key="category.id"
                                            class="badge bg-light text-dark"
                                        >
                                            {{ category.name }}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                    <!-- 3. 하단: 리스트 뷰 및 Mock 페이지네이션 (Bottom Section) -->
                    <section class="list-section mb-5" v-if="listPosts.length > 0">
                        <h2 class="section-title mb-4">
                            <font-awesome-icon :icon="['fas', 'list']" class="me-2" />
                            전체 목록
                        </h2>

                        <!-- 리스트 뷰 -->
                        <div class="list-group">
                            <div
                                v-for="post in listPosts"
                                :key="post.id"
                                class="list-group-item list-group-item-action border-0 mb-3"
                            >

                                <!-- Case A: 썸네일이 있는 경우 -->
                                <div v-if="post.thumbnail_url"
                                     class="card h-100 list-card-with-thumbnail"
                                     @click="navigateToPost(post.id)">
                                    <div class="row g-0 align-items-center">
                                        <!-- 썸네일 (좌측) -->
                                        <div class="col-md-3">
                                            <img
                                                :src="post.thumbnail_url"
                                                :alt="post.title"
                                                class="img-fluid rounded-start list-thumbnail"
                                            />
                                        </div>
                                        <!-- 콘텐츠 (우측) -->
                                        <div class="col-md-9">
                                            <div class="card-body">
                                                <!-- 블로그 제목 (fw-bold) -->
                                                <h5 class="card-title">{{ post.title }}</h5>
                                                <!-- 등록일자 및 조회수 -->
                                                <div class="post-meta">
                                                    <small class="text-muted">
                                                        <i class="far fa-calendar-alt me-1"></i>
                                                        {{ formatDate(post.published_at || post.last_edited_time) }}
                                                    </small>
                                                    <small class="text-muted">
                                                        <i class="far fa-eye me-1"></i>
                                                        {{ formatViews(post.hits) }}
                                                    </small>
                                                </div>
                                                <!-- 카테고리 -->
                                                <div class="post-categories">
                                                    <span
                                                        v-for="category in post.category"
                                                        :key="category.id"
                                                        class="badge bg-secondary"
                                                    >
                                                        {{ category.name }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Case B: 썸네일이 없는 경우 -->
                                <div v-else
                                     class="card h-100 list-card-no-thumbnail"
                                     @click="navigateToPost(post.id)">
                                    <!-- 블로그 제목 (fw-bold) -->
                                    <h5 class="card-title">{{ post.title }}</h5>
                                    <!-- 블로그 미리보기 글 전체 -->
                                    <p class="card-description"
                                       v-if="post.description && post.description !== '미리보기 없음'">
                                        {{ truncateDescription(post.description, 120) }}
                                    </p>
                                    <!-- 등록일자 및 조회수 -->
                                    <div class="post-meta">
                                        <small class="text-muted">
                                            <i class="far fa-calendar-alt me-1"></i>
                                            {{ formatDate(post.published_at || post.last_edited_time) }}
                                        </small>
                                        <small class="text-muted">
                                            <i class="far fa-eye me-1"></i>
                                            {{ formatViews(post.hits) }}
                                        </small>
                                    </div>
                                    <!-- 카테고리 -->
                                    <div class="post-categories">
                                        <span
                                            v-for="category in post.category"
                                            :key="category.id"
                                            class="badge bg-secondary"
                                        >
                                            {{ category.name }}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!-- 더보기 (Load More) 버튼 -->
                        <div class="text-center mt-4" v-if="showLoadMore">
                            <button
                                class="btn btn-outline-secondary btn-load-more"
                                @click="loadMore"
                            >
                                <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
                                더보기 ({{ filteredAndSortedPosts.length - 3 - displayLimit }}개 더)
                            </button>
                        </div>
                    </section>

                    <!-- 글이 없는 경우 -->
                    <div v-if="filteredAndSortedPosts.length === 0" class="no-results">
                        <font-awesome-icon :icon="['fas', 'search']" class="no-results-icon" />
                        <h4>검색 결과가 없습니다</h4>
                        <p>다른 카테고리를 선택해보세요.</p>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
@import '@/assets/style/home.scss';
</style>
