<template>
    <div class="column-list-container">
        <div class="row g-3" :class="getGridClass">
            <NotionBlock
                v-for="child in block.children"
                :key="child.id"
                :block="child"
                :depth="depth"
                :max-depth="maxDepth"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NotionBlock from './NotionBlock.vue'
import type { Block } from '@/api/generated/api'

interface Props {
    block: Block
    depth?: number
    maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
    depth: 0,
    maxDepth: 10
})

/**
 * 컬럼 개수에 따른 Grid 클래스 결정
 * 최대 4개까지의 컬럼을 지원하며, 모바일에서는 세로 스택으로 배치
 */
const getGridClass = computed((): string => {
    const columnCount = props.block.children?.length || 2

    // 컬럼 개수에 따른 반응형 클래스 설정
    switch (columnCount) {
        case 1:
            return 'row-cols-1'
        case 2:
            return 'row-cols-1 row-cols-md-2'
        case 3:
            return 'row-cols-1 row-cols-md-3'
        case 4:
            return 'row-cols-1 row-cols-md-2 row-cols-lg-4'
        default:
            // 5개 이상의 경우 최대 4개로 제한하고 나머지는 다음 줄로
            return 'row-cols-1 row-cols-md-2 row-cols-lg-4'
    }
})
</script>

<style scoped lang="scss">
.column-list-container {
    margin: 1.5rem 0;

    // 컬럼 리스트 전체에 약간의 패딩 추가
    .row {
        // 컬럼 간 간격을 위한 기본 설정
        margin: 0 -0.75rem;

        // 각 컬럼에 기본 패딩 적용
        > * {
            padding: 0 0.75rem;
        }
    }
}

// 모바일에서의 스타일 조정
@media (max-width: 767.98px) {
    .column-list-container {
        margin: 1rem 0;

        .row {
            margin: 0 -0.5rem;

            > * {
                padding: 0 0.5rem;
                margin-bottom: 1rem;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
}

// 태블릿에서의 스타일 조정
@media (min-width: 768px) and (max-width: 991.98px) {
    .column-list-container {
        .row {
            > * {
                margin-bottom: 1.5rem;

                &:last-child,
                &:nth-last-child(2):nth-child(odd) {
                    margin-bottom: 0;
                }
            }
        }
    }
}

// 데스크탑에서의 스타일
@media (min-width: 992px) {
    .column-list-container {
        .row {
            align-items: flex-start; // 컬럼들을 상단 정렬
        }
    }
}

// 다크 모드 지원
@media (prefers-color-scheme: dark) {
    .column-list-container {
        // 필요시 다크 모드 스타일 추가
    }
}

// 인쇄 시 스타일
@media print {
    .column-list-container {
        .row {
            display: flex !important;
            flex-wrap: nowrap !important;
            margin: 0 !important;

            > * {
                flex: 1 !important;
                padding: 0 0.25rem !important;
                margin-bottom: 0 !important;
            }
        }
    }
}
</style>
