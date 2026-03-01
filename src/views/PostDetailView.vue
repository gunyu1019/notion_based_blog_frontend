<template>
    <div class="post-detail-view">

        <!-- 웨이브 배경 -->
        <Wave type="1" />

        <div class="content-wrapper">
            <div class="container py-5">
                <!-- 로딩 상태 -->
                <div v-if="loading" class="status-center">
                    <font-awesome-icon
                        :icon="['fas', 'circle-notch']"
                        spin
                        size="2x"
                        class="mb-3 text-primary"
                    />
                    <p class="text-muted">게시글을 불러오는 중입니다...</p>
                </div>

                <!-- 에러 상태 -->
                <div v-else-if="error" class="status-center">
                    <font-awesome-icon
                        v-if="isAccessDenied()"
                        :icon="['fas', 'lock']"
                        size="3x"
                        class="mb-3 text-secondary"
                    />
                    <font-awesome-icon
                        v-else
                        :icon="['fas', 'exclamation-triangle']"
                        size="3x"
                        class="mb-3 text-danger"
                    />
                    <h3 v-if="isAccessDenied()" class="text-dark fw-bold mb-3">접근이 제한된 게시글입니다.</h3>
                    <h3 v-else class="text-danger mb-3">게시글을 불러오는 중 오류가 발생했습니다.</h3>
                    <p class="text-muted mb-4">{{ error }}</p>
                    <div class="d-flex gap-2">
                        <button @click="retry" class="btn btn-outline-primary btn-sm">
                            <font-awesome-icon :icon="['fas', 'redo']" class="me-1" />
                            다시 시도
                        </button>
                        <router-link to="/" class="btn btn-outline-secondary btn-sm">
                            <font-awesome-icon :icon="['fas', 'home']" class="me-1" />
                            홈으로
                        </router-link>
                    </div>
                </div>

                <!-- 게시글 내용 -->
                <article v-else-if="postDetail" class="post-article">
                    <!-- 게시글 헤더 -->
                    <header class="post-header">
                        <!-- 카테고리 배지 -->
                        <div v-if="postDetail.category && postDetail.category.length > 0" class="mb-3">
                            <span
                                v-for="category in postDetail.category"
                                :key="category.id"
                                class="badge bg-primary me-2 fs-6 px-3 py-2"
                            >
                                {{ category.name }}
                            </span>
                        </div>

                        <!-- 제목 -->
                        <h1 class="h3 fw-bold mb-4">{{ postDetail.title }}</h1>

                        <!-- 메타 정보 (조회수만) -->
                        <div class="post-meta">
                            <div class="meta-item">
                                <font-awesome-icon :icon="['fas', 'eye']" />
                                <span>{{ postDetail.hits || 0 }}회 조회</span>
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
                        <div v-else class="empty-content">
                            <font-awesome-icon :icon="['fas', 'file-alt']" size="3x" />
                            <p>내용이 없습니다.</p>
                        </div>
                    </div>
                </article>

                <!-- 게시글이 없는 경우 -->
                <div v-else class="status-center">
                    <font-awesome-icon :icon="['fas', 'search']" size="3x" class="text-muted mb-3" />
                    <h3 class="text-muted mb-3">게시글을 찾을 수 없습니다</h3>
                    <p class="text-muted mb-4">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
                    <router-link to="/" class="btn btn-primary">
                        <font-awesome-icon :icon="['fas', 'home']" class="me-2" />
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NotionBlock from '@/components/block/NotionBlock.vue'
import { extendedApi, type PostItemDetail } from '@/api'
import '@/assets/style/post.scss'

// 컴포넌트 별칭
const Wave = WaveItem

const route = useRoute()

// 상태 관리
const postDetail = ref<PostItemDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// 접근 권한 관련 함수
const isAccessDenied = () => {
    return error.value?.includes('접근이 제한') ||
           error.value?.includes('권한') ||
           error.value?.includes('비공개')
}

/**
 * 게시글 데이터 가져오기
 */
const fetchPostDetail = async (postId: string) => {
    try {
        loading.value = true
        error.value = null

        const response = await extendedApi.getPost(postId)
        postDetail.value = response.data
    } catch (err: any) {
        console.error('Failed to fetch post detail:', err)

        if (err.response?.status === 403) {
            error.value = '접근이 제한된 게시글입니다.'
        } else if (err.response?.status === 404) {
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

<style>
/* PostDetailView 컴포넌트의 모든 스타일은 post.scss에서 관리합니다 */
</style>
