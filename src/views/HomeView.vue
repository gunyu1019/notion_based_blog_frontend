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
const { categories, selectedCategory } = storeToRefs(categoryStore)

// 정렬 옵션
const sortOption = ref<'date' | 'views'>('date')

// 필터링 및 정렬된 게시글 목록
const filteredAndSortedPosts = computed(() => {
    let filtered = content.value

    // 카테고리 필터링
    if (selectedCategory.value) {
        filtered = filtered.filter(post =>
            post.category.some(cat => cat.id === selectedCategory.value)
        )
    }

    // 정렬
    if (sortOption.value === 'date') {
        filtered = [...filtered].sort((a, b) =>
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        )
    } else {
        filtered = [...filtered].sort((a, b) =>
            Number(b.hits) - Number(a.hits)
        )
    }

    return filtered
})

// 날짜 포맷 함수
function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

// 조회수 포맷 함수
function formatViews(views: bigint): string {
    const num = Number(views)
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
}

// 카테고리 선택 함수
function selectCategory(categoryId: string | null) {
    categoryStore.setSelectedCategory(categoryId)
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
    postItemStore.fetchContent()
    categoryStore.fetchCategories()
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

        <!-- Category Filters -->
        <div class="category-section">
            <div class="container-fluid">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-10">
                        <div class="category-filters">
                            <button
                                class="category-btn"
                                :class="{ 'active': selectedCategory === null }"
                                @click="selectCategory(null)"
                            >
                                전체
                            </button>
                            <button
                                v-for="category in categories"
                                :key="String(category.id)"
                                class="category-btn"
                                :class="{ 'active': selectedCategory === category.id }"
                                @click="selectCategory(String(category.id))"
                            >
                                {{ String(category.name) }}
                            </button>
                        </div>

                        <!-- Sort Options with Bootstrap Dropdown -->
                        <div class="sort-section">
                            <div class="dropdown">
                                <button
                                    class="btn btn-outline-secondary dropdown-toggle sort-dropdown-btn"
                                    type="button"
                                    id="sortDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <font-awesome-icon icon="sort-amount-down" class="me-2" />
                                    {{ sortOption === 'date' ? '최신순' : '인기순' }}
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="sortDropdown">
                                    <li>
                                        <button
                                            class="dropdown-item"
                                            :class="{ 'active': sortOption === 'date' }"
                                            @click="sortOption = 'date'"
                                        >
                                            <font-awesome-icon
                                                icon="check"
                                                class="me-2"
                                                :class="{ 'invisible': sortOption !== 'date' }"
                                            />
                                            최신순 (등록일)
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            class="dropdown-item"
                                            :class="{ 'active': sortOption === 'views' }"
                                            @click="sortOption = 'views'"
                                        >
                                            <font-awesome-icon
                                                icon="check"
                                                class="me-2"
                                                :class="{ 'invisible': sortOption !== 'views' }"
                                            />
                                            인기순 (조회수)
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Post Grid -->
        <div class="posts-section posts-bottom-spacing">
            <div class="container-fluid">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-10">
                        <div class="row g-4">
                            <div
                                v-for="post in filteredAndSortedPosts"
                                :key="String(post.id)"
                                class="col-12 col-md-4"
                            >
                                <div class="post-card">
                                    <div class="post-thumbnail">
                                        <img
                                            :src="String(post.thumbnail_url)"
                                            :alt="String(post.title)"
                                            class="thumbnail-image"
                                        />
                                    </div>
                                    <div class="post-content">
                                        <h3 class="post-title">{{ String(post.title) }}</h3>
                                        <div class="post-meta">
                                            <span class="meta-item">
                                                <font-awesome-icon icon="calendar-alt" />
                                                {{ formatDate(post.published_at) }}
                                            </span>
                                            <span class="meta-item">
                                                <font-awesome-icon icon="eye" />
                                                {{ formatViews(post.hits) }}
                                            </span>
                                        </div>
                                        <div class="post-categories">
                                            <span
                                                v-for="category in post.category"
                                                :key="String(category.id)"
                                                class="category-tag"
                                            >
                                                {{ String(category.name) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="footer">
            <div class="container-fluid">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-10">
                        <div class="footer-content">
                            <p class="footer-copyright">
                                Copyright(©) 2022-present gunyu1019 All right reserved. 통합 이용약관
                            </p>
                            <p class="footer-design">
                                Designed By gunyu1019
                            </p>
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
    margin-bottom: 60px;
}

// Category Filters Section
.category-section {
    margin-bottom: 40px;

    .category-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 20px;
        justify-content: center;

        @media (min-width: 768px) {
            justify-content: flex-start;
        }
    }

    .category-btn {
        background: transparent;
        border: 1.5px solid #333333;
        color: #333333;
        padding: 8px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background: #f8f9fa;
        }

        &.active {
            background: #333333;
            color: #ffffff;
        }
    }

    .sort-section {
        display: flex;
        justify-content: center;

        @media (min-width: 768px) {
            justify-content: flex-end;
        }

        .sort-dropdown-btn {
            font-size: 14px;
            padding: 8px 16px;
            border-radius: 6px;
            transition: all 0.2s ease;

            &:focus {
                box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
            }
        }

        .dropdown-menu {
            border-radius: 8px;
            border: 1px solid #dee2e6;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

            .dropdown-item {
                padding: 8px 16px;
                font-size: 14px;
                transition: all 0.15s ease;

                &:hover {
                    background-color: #f8f9fa;
                }

                &.active {
                    background-color: #e9ecef;
                    font-weight: 500;
                }

                svg {
                    width: 12px;
                    height: 12px;
                }
            }
        }
    }
}

// 200px 여백을 위한 커스텀 클래스
.posts-bottom-spacing {
    margin-bottom: 200px;
}

// Posts Section
.posts-section {
    margin-bottom: 80px;

    .post-card {
        background: #ffffff;
        border: 1px solid #f1f3f4;
        border-radius: 12px;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        height: 100%;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
    }

    .post-thumbnail {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: #f8f9fa;

        .thumbnail-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        &:hover .thumbnail-image {
            transform: scale(1.05);
        }
    }

    .post-content {
        padding: 20px;
    }

    .post-title {
        font-size: 18px;
        font-weight: 600;
        color: #212529;
        margin-bottom: 12px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .post-meta {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;

        .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #6c757d;

            svg {
                font-size: 12px;
            }
        }
    }

    .post-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .category-tag {
            background: #f8f9fa;
            color: #495057;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
    }
}

// Footer
.footer {
    border-top: 1px solid #f1f3f4;
    padding: 40px 0;
    margin-top: auto;

    .footer-content {
        text-align: center;

        @media (min-width: 768px) {
            text-align: left;
        }
    }

    .footer-copyright,
    .footer-design {
        color: #6c757d;
        font-size: 14px;
        margin: 0;
        line-height: 1.5;
    }

    .footer-copyright {
        margin-bottom: 4px;
    }
}

// 반응형 조정
@media (max-width: 767.98px) {
    .home-container {
        padding-top: 70px;
    }

    .top-spacing {
        height: 100px;
        margin-bottom: 40px;
    }

    .posts-section {
        margin-bottom: 60px;
    }
}
</style>
