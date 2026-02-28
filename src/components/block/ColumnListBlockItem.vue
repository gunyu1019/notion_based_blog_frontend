<template>
    <div class="column-list-container">
        <div class="row w-100 mx-0" :class="getRowClasses">
            <ColumnBlockItem
                v-for="child in block.children"
                :key="child.id"
                :block="child"
                :depth="depth + 1"
                :max-depth="maxDepth"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ColumnBlockItem from './ColumnBlockItem.vue'
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
 * 컬럼 개수에 따른 Row 클래스 결정
 * Bootstrap의 flex 기반 자동 등분 활용
 */
const getRowClasses = computed((): string[] => {
    const columnCount = props.block.children?.length || 1
    const classes = ['g-3'] // 기본 gutter 간격

    // 컬럼 개수에 따른 반응형 클래스
    if (columnCount === 1) {
        classes.push('justify-content-center')
    } else if (columnCount <= 4) {
        // 4개 이하일 때는 균등 분할
        classes.push('align-items-stretch')
    } else {
        // 4개 초과시에는 줄바꿈 허용하며 최대 4개씩 배치
        classes.push('row-cols-1', 'row-cols-sm-2', 'row-cols-md-3', 'row-cols-lg-4')
    }

    return classes
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
