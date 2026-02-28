<script lang="ts" setup>
import { usePostItemStore } from '@/stores/postItem'
import { useCategoryStore } from '@/stores/category'
import { onMounted, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Wave from '@/components/WaveItem.vue'
import HeaderNavbar from '@/components/HeaderNavbar.vue'

// 스토어 초기화
const postItemStore = usePostItemStore()
const categoryStore = useCategoryStore()
const { content } = storeToRefs(postItemStore)

// 상태 관리 (State)
const selectedCategory = ref<string | null>(null)
const sortOption = ref<'latest' | 'views'>('latest')
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

    // 정렬
    if (sortOption.value === 'latest') {
        filtered = [...filtered].sort((a, b) => {
            const dateA = a.published_at ? new Date(a.published_at).getTime() : a.last_edited_time ? new Date(a.last_edited_time).getTime() : 0
            const dateB = b.published_at ? new Date(b.published_at).getTime() : b.last_edited_time ? new Date(b.last_edited_time).getTime() : 0
            return dateB - dateA
        })
    } else {
        filtered = [...filtered].sort((a, b) => Number(b.hits || 0) - Number(a.hits || 0))
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

// 더보기 버튼 클릭 핸들러
function loadMore() {
    displayLimit.value += 5
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
                            <div class="dropdown">
                                <button
                                    class="btn btn-outline-secondary dropdown-toggle"
                                    type="button"
                                    id="sortDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <i class="fas fa-sort me-2"></i>
                                    {{ sortOption === 'latest' ? '최신순' : '조회순' }}
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="sortDropdown">
                                    <li>
                                        <button
                                            class="dropdown-item"
                                            :class="{ active: sortOption === 'latest' }"
                                            @click="sortOption = 'latest'"
                                        >
                                            <i class="fas fa-clock me-2"></i>
                                            최신순 (등록일)
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            class="dropdown-item"
                                            :class="{ active: sortOption === 'views' }"
                                            @click="sortOption = 'views'"
                                        >
                                            <i class="fas fa-eye me-2"></i>
                                            조회순 (인기)
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- 2. 중앙: Top 3 하이라이트 카드 (Middle Section) -->
                    <section class="highlight-section mb-5" v-if="topPosts.length > 0">
                        <h2 class="section-title mb-4">
                            <i class="fas fa-star me-2"></i>
                            {{ sortOption === 'latest' ? '최신 글' : '인기 글' }}
                        </h2>
                        <div class="row g-4">
                            <div v-for="post in topPosts" :key="post.id" class="col-md-4">
                                <div class="card h-100 highlight-card">
                                    <!-- 썸네일 이미지 또는 미리보기 텍스트 -->
                                    <div v-if="post.thumbnail_url" class="card-img-top-wrapper">
                                        <img
                                            :src="post.thumbnail_url"
                                            :alt="post.title"
                                            class="card-img-top"
                                        />
                                    </div>
                                    <div v-else class="card-preview-text">
                                        <p>{{ truncateDescription(post.description, 80) }}</p>
                                    </div>

                                    <div class="card-body">
                                        <h5 class="card-title">{{ post.title }}</h5>
                                        <div class="card-meta d-flex justify-content-between align-items-center">
                                            <small class="text-muted">
                                                <i class="fas fa-calendar-alt me-1"></i>
                                                {{ formatDate(post.published_at || post.last_edited_time) }}
                                            </small>
                                            <small class="text-muted">
                                                <i class="fas fa-eye me-1"></i>
                                                {{ formatViews(post.hits) }}
                                            </small>
                                        </div>
                                        <div class="card-categories mt-2">
                                            <span
                                                v-for="category in post.category"
                                                :key="category.id"
                                                class="badge bg-light text-dark me-1"
                                            >
                                                {{ category.name }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- 3. 하단: 리스트 뷰 및 Mock 페이지네이션 (Bottom Section) -->
                    <section class="list-section mb-5" v-if="listPosts.length > 0">
                        <h2 class="section-title mb-4">
                            <i class="fas fa-list me-2"></i>
                            전체 목록
                        </h2>

                        <!-- 리스트 뷰 -->
                        <div class="list-group">
                            <div
                                v-for="post in listPosts"
                                :key="post.id"
                                class="list-group-item list-group-item-action border-0 mb-3"
                            >
                                <div class="card h-100 list-card">
                                    <div class="row g-0 align-items-center">
                                        <!-- 썸네일 (좌측) -->
                                        <div class="col-md-3" v-if="post.thumbnail_url">
                                            <img
                                                :src="post.thumbnail_url"
                                                :alt="post.title"
                                                class="img-fluid rounded-start list-thumbnail"
                                            />
                                        </div>
                                        <!-- 콘텐츠 (우측) -->
                                        <div :class="post.thumbnail_url ? 'col-md-9' : 'col-12'">
                                            <div class="card-body">
                                                <h5 class="card-title">{{ post.title }}</h5>
                                                <p class="card-text text-muted" v-if="post.description">
                                                    {{ truncateDescription(post.description, 120) }}
                                                </p>
                                                <div class="d-flex justify-content-between align-items-center mt-3">
                                                    <div class="post-meta">
                                                        <small class="text-muted me-3">
                                                            <i class="fas fa-calendar-alt me-1"></i>
                                                            {{ formatDate(post.published_at || post.last_edited_time) }}
                                                        </small>
                                                        <small class="text-muted">
                                                            <i class="fas fa-eye me-1"></i>
                                                            {{ formatViews(post.hits) }}
                                                        </small>
                                                    </div>
                                                    <div class="post-categories">
                                                        <span
                                                            v-for="category in post.category"
                                                            :key="category.id"
                                                            class="badge bg-secondary me-1"
                                                        >
                                                            {{ category.name }}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 더보기 (Load More) 버튼 -->
                        <div class="text-center mt-4" v-if="showLoadMore">
                            <button
                                class="btn btn-outline-secondary"
                                @click="loadMore"
                            >
                                <i class="fas fa-plus me-2"></i>
                                더보기 ({{ filteredAndSortedPosts.length - 3 - displayLimit }}개 더)
                            </button>
                        </div>
                    </section>

                    <!-- 글이 없는 경우 -->
                    <div v-if="filteredAndSortedPosts.length === 0" class="text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h4 class="text-muted">검색 결과가 없습니다</h4>
                        <p class="text-muted">다른 카테고리를 선택해보세요.</p>
                    </div>

                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="footer mt-5">
            <div class="container-fluid">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-10">
                        <div class="footer-content text-center">
                            <p class="footer-copyright mb-1">
                                Copyright(©) 2022-present gunyu1019 All right reserved. 통합 이용약관
                            </p>
                            <p class="footer-design mb-0">Designed By gunyu1019</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Bottom Wave Decoration -->
        <Wave type="2" />
    </div>
</template>

<style lang="scss" scoped>
.home-container {
    background: #ffffff;
    min-height: 100vh;
    padding-top: 80px; // Header 높이만큼 여백
}

.top-spacing {
    height: 150px;
    display: flex;
    align-items: flex-end;
    margin-bottom: 40px;
}

// 1. 상단 필터 및 정렬 바 스타일
.filter-sort-section {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e9ecef;

    .category-nav {
        .nav-pills {
            .nav-item {
                margin-right: 8px;

                .nav-link {
                    background: transparent;
                    border: 1.5px solid #333333;
                    color: #333333;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    cursor: pointer;

                    &:hover {
                        background: #f8f9fa;
                        border-color: #495057;
                    }

                    &.active {
                        background: #333333;
                        color: #ffffff;
                        border-color: #333333;
                    }
                }
            }
        }
    }

    .sort-dropdown {
        .dropdown-toggle {
            font-size: 14px;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.2s ease;

            &:focus {
                box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
            }
        }

        .dropdown-menu {
            border-radius: 8px;
            border: 1px solid #dee2e6;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            min-width: 180px;

            .dropdown-item {
                padding: 10px 16px;
                font-size: 14px;
                transition: all 0.15s ease;

                &:hover {
                    background-color: #f8f9fa;
                }

                &.active {
                    background-color: #e9ecef;
                    font-weight: 500;
                }

                i {
                    width: 16px;
                    text-align: center;
                }
            }
        }
    }
}

// 2. 중앙 Top 3 하이라이트 카드 스타일
.highlight-section {
    .section-title {
        font-size: 1.75rem;
        font-weight: 600;
        color: #212529;
        display: flex;
        align-items: center;

        i {
            color: #ffc107;
        }
    }

    .highlight-card {
        border: 1px solid #e9ecef;
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .card-img-top-wrapper {
            position: relative;
            height: 200px;
            overflow: hidden;

            .card-img-top {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }

            &:hover .card-img-top {
                transform: scale(1.05);
            }
        }

        .card-preview-text {
            height: 200px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            display: flex;
            align-items: center;
            padding: 20px;

            p {
                color: #6c757d;
                font-size: 14px;
                line-height: 1.5;
                text-align: center;
                margin: 0;
            }
        }

        .card-body {
            padding: 20px;

            .card-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #212529;
                margin-bottom: 12px;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .card-meta {
                margin-bottom: 12px;

                small {
                    font-size: 13px;

                    i {
                        color: #6c757d;
                    }
                }
            }

            .card-categories {
                .badge {
                    font-size: 11px;
                    padding: 4px 8px;
                    border-radius: 8px;
                }
            }
        }
    }
}

// 3. 하단 리스트 뷰 스타일
.list-section {
    .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #212529;
        display: flex;
        align-items: center;

        i {
            color: #6c757d;
        }
    }

    .list-card {
        border: 1px solid #e9ecef;
        border-radius: 12px;
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);

        &:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            border-color: #dee2e6;
        }

        .list-thumbnail {
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
        }

        .card-body {
            padding: 20px;

            .card-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #212529;
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .card-text {
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 0;
            }

            .post-meta {
                small {
                    font-size: 13px;

                    i {
                        color: #6c757d;
                    }
                }
            }

            .post-categories {
                .badge {
                    font-size: 11px;
                    padding: 4px 8px;
                    border-radius: 8px;
                }
            }
        }
    }
}

// Footer 스타일
.footer {
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    padding: 40px 0;
    margin-bottom: 200px; // Wave 컴포넌트를 위한 여백

    .footer-content {
        .footer-copyright,
        .footer-design {
            color: #6c757d;
            font-size: 14px;
            margin: 0;
        }
    }
}

// 반응형 조정
@media (max-width: 767.98px) {
    .home-container {
        padding-top: 70px;
    }

    .top-spacing {
        height: 100px;
        margin-bottom: 30px;
    }

    .filter-sort-section {
        flex-direction: column;
        align-items: stretch !important;

        .category-nav {
            margin-bottom: 16px;

            .nav-pills {
                justify-content: center !important;
                flex-wrap: wrap;
                gap: 8px;
            }
        }

        .sort-dropdown {
            align-self: center;
        }
    }

    .highlight-section {
        .section-title {
            font-size: 1.5rem;
            text-align: center;
            justify-content: center;
            margin-bottom: 24px;
        }
    }

    .list-section {
        .section-title {
            font-size: 1.25rem;
            text-align: center;
            justify-content: center;
            margin-bottom: 24px;
        }

        .list-card {
            .row {
                .col-md-3,
                .col-md-9 {
                    // 모바일에서는 세로 레이아웃
                }
            }
        }
    }

    .footer {
        margin-bottom: 150px;
    }
}

// 더보기 버튼 스타일
.btn-outline-secondary {
    padding: 12px 24px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    i {
        font-size: 14px;
    }
}
</style>
