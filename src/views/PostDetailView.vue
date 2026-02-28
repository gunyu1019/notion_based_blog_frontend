<template>
    <div class="post-detail-view">
        <!-- 헤더 네비게이션 -->
        <HeaderNavbar />

        <!-- 웨이브 배경 -->
        <Wave type="1" />

        <div class="content-wrapper">
            <div class="container py-5">
                <!-- 로딩 상태 -->
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">로딩 중...</span>
                    </div>
                    <p class="mt-3 text-muted">게시글을 불러오는 중...</p>
                </div>

                <!-- 에러 상태 -->
                <div v-else-if="error" class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        오류 발생
                    </h4>
                    <p class="mb-0">{{ error }}</p>
                    <hr />
                    <div class="d-flex gap-2">
                        <button @click="retry" class="btn btn-outline-danger btn-sm">
                            <i class="fas fa-redo me-1"></i>
                            다시 시도
                        </button>
                        <router-link to="/" class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-home me-1"></i>
                            홈으로
                        </router-link>
                    </div>
                </div>

                <!-- 게시글 내용 -->
                <article v-else-if="postDetail" class="post-article">
                    <!-- 게시글 헤더 -->
                    <header class="post-header mb-5">
                        <div class="row">
                            <div class="col-12">
                                <!-- 카테고리 -->
                                <div
                                    v-if="postDetail.category && postDetail.category.length > 0"
                                    class="mb-3"
                                >
                                    <span
                                        v-for="category in postDetail.category"
                                        :key="category.id"
                                        class="badge bg-secondary me-2"
                                    >
                                        {{ category.name }}
                                    </span>
                                </div>

                                <!-- 제목 -->
                                <h1 class="display-4 fw-bold mb-3">{{ postDetail.title }}</h1>

                                <!-- 메타 정보 -->
                                <div class="d-flex flex-wrap align-items-center text-muted mb-4">
                                    <div class="me-4 mb-2">
                                        <i class="fas fa-calendar-alt me-2"></i>
                                        <span v-if="postDetail.published_at">
                                            {{ formatDate(postDetail.published_at) }}
                                        </span>
                                        <span v-else>발행일 없음</span>
                                    </div>
                                    <div class="me-4 mb-2">
                                        <i class="fas fa-edit me-2"></i>
                                        <span v-if="postDetail.last_edited_time">
                                            {{ formatDate(postDetail.last_edited_time) }}
                                        </span>
                                    </div>
                                    <div class="mb-2">
                                        <i class="fas fa-eye me-2"></i>
                                        <span>{{ postDetail.hits || 0 }}회 조회</span>
                                    </div>
                                </div>

                                <!-- 설명 -->
                                <p
                                    v-if="
                                        postDetail.description &&
                                        postDetail.description !== '미리보기 없음'
                                    "
                                    class="lead text-muted"
                                >
                                    {{ postDetail.description }}
                                </p>
                            </div>
                        </div>
                    </header>

                    <!-- 썸네일 이미지 -->
                    <div v-if="postDetail.thumbnail_url" class="text-center mb-5">
                        <img
                            :src="postDetail.thumbnail_url"
                            :alt="postDetail.title"
                            class="img-fluid rounded shadow-lg"
                            style="max-height: 400px; object-fit: cover"
                        />
                    </div>

                    <!-- 게시글 본문 -->
                    <div class="post-content">
                        <div v-if="postDetail.content && postDetail.content.length > 0">
                            <NotionBlock
                                v-for="block in postDetail.content"
                                :key="block.id"
                                :block="block"
                            />
                        </div>
                        <div v-else class="text-center py-5 text-muted">
                            <i class="fas fa-file-alt fa-3x mb-3"></i>
                            <p>내용이 없습니다.</p>
                        </div>
                    </div>
                </article>

                <!-- 게시글이 없는 경우 -->
                <div v-else class="text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h3 class="text-muted">게시글을 찾을 수 없습니다</h3>
                    <p class="text-muted">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
                    <router-link to="/" class="btn btn-primary">
                        <i class="fas fa-home me-2"></i>
                        홈으로 돌아가기
                    </router-link>
                </div>
            </div>
        </div>

        <!-- 하단 웨이브 -->
        <div class="wrapper" style="background: #373b3e; padding: 100px 0"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderNavbar from '@/components/HeaderNavbar.vue'
import WaveItem from '@/components/WaveItem.vue'
import NotionBlock from '@/components/block/NotionBlock.vue'
import { DefaultApi } from '@/api/generated/api'
import type { PostItemDetail } from '@/api/generated/api'

// 컴포넌트 별칭
const Wave = WaveItem

const route = useRoute()
const router = useRouter()

// 상태 관리
const postDetail = ref<PostItemDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// API 인스턴스
const api = new DefaultApi()

/**
 * 게시글 데이터 가져오기
 */
const fetchPostDetail = async (postId: string) => {
    try {
        loading.value = true
        error.value = null

        const response = await api.postInfoPostGet(postId)
        postDetail.value = response.data
    } catch (err: any) {
        console.error('Failed to fetch post detail:', err)

        if (err.response?.status === 404) {
            error.value = '게시글을 찾을 수 없습니다.'
        } else if (err.response?.status >= 500) {
            error.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else {
            error.value = '게시글을 불러오는 중 오류가 발생했습니다.'
        }
    } finally {
        loading.value = false
    }
}

/**
 * 재시도 함수
 */
const retry = () => {
    const postId = getPostIdFromRoute()
    if (postId) {
        fetchPostDetail(postId)
    }
}

/**
 * 라우트에서 post_id 추출
 */
const getPostIdFromRoute = (): string | null => {
    // 쿼리 파라미터에서 확인
    if (route.query.post_id) {
        return route.query.post_id as string
    }

    // 라우트 파라미터에서 확인 (/:id 형태)
    if (route.params.id) {
        return route.params.id as string
    }

    return null
}

/**
 * 날짜 포매팅
 */
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch {
        return dateString
    }
}

/**
 * 컴포넌트 마운트 시 실행
 */
onMounted(() => {
    const postId = getPostIdFromRoute()

    if (!postId) {
        error.value = '유효하지 않은 게시글 ID입니다.'
        loading.value = false
        return
    }

    fetchPostDetail(postId)
})
</script>

<style lang="scss" scoped>
.post-detail-view {
    min-height: 100vh;
}

.content-wrapper {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    min-height: 80vh;
}

.post-article {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 3rem;
    margin-bottom: 2rem;
}

.post-header {
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 2rem;
}

.post-content {
    line-height: 1.8;
    font-size: 1.1rem;
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3),
.post-content :deep(h4),
.post-content :deep(h5),
.post-content :deep(h6) {
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
}

.post-content :deep(p) {
    margin-bottom: 1.25rem;
}

.post-content :deep(pre) {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    margin: 1.5rem 0;
    overflow-x: auto;
}

.post-content :deep(.table) {
    margin: 1.5rem 0;
}

.post-content :deep(blockquote) {
    border-left: 4px solid #007bff;
    background-color: #f8f9fa;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 0 8px 8px 0;
}

.post-content :deep(.alert) {
    margin: 1.5rem 0;
}

.post-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 1rem 0;
}

@media (max-width: 768px) {
    .post-article {
        padding: 1.5rem;
        margin: 0 1rem 2rem;
        border-radius: 8px;
    }

    .post-content {
        font-size: 1rem;
    }
}
</style>
