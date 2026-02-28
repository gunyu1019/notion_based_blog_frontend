<template>
    <div class="table-block-item mb-4">
        <div class="table-responsive table-container">
            <table class="table table-bordered table-hover">
                <!-- 헤더 영역 -->
                <thead v-if="tableData.hasColumnHeader" class="table-dark">
                    <tr>
                        <th
                            v-for="(cell, index) in tableData.headers"
                            :key="`header-${index}`"
                            scope="col"
                            class="table-header-cell"
                        >
                            <RichTextRenderer :rich-texts="cell || []" />
                        </th>
                    </tr>
                </thead>

                <!-- 본문 영역 -->
                <tbody>
                    <tr
                        v-for="(row, rowIndex) in tableData.rows"
                        :key="`row-${rowIndex}`"
                        class="table-row"
                    >
                        <template
                            v-for="(cell, cellIndex) in row"
                            :key="`cell-${rowIndex}-${cellIndex}`"
                        >
                            <!-- 행 헤더 -->
                            <th
                                v-if="tableData.hasRowHeader && cellIndex === 0"
                                scope="row"
                                class="table-row-header"
                            >
                                <RichTextRenderer :rich-texts="cell || []" />
                            </th>
                            <!-- 일반 셀 -->
                            <td
                                v-else
                                class="table-cell"
                                :class="{ 'table-cell-empty': isCellEmpty(cell) }"
                            >
                                <RichTextRenderer :rich-texts="cell || []" />
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 테이블 메타 정보 -->
        <div v-if="showTableInfo" class="table-info mt-2">
            <small class="text-muted">
                <i class="fas fa-table me-1"></i>
                {{ tableData.rows.length }}행 × {{ getColumnCount() }}열
                <span v-if="tableData.hasColumnHeader" class="ms-2">
                    <i class="fas fa-columns me-1"></i>열 헤더 포함
                </span>
                <span v-if="tableData.hasRowHeader" class="ms-2">
                    <i class="fas fa-grip-lines-vertical me-1"></i>행 헤더 포함
                </span>
            </small>
        </div>

        <!-- 캡션 -->
        <div
            v-if="tableBlock.captions && tableBlock.captions.length > 0"
            class="table-caption mt-2"
        >
            <small class="text-muted">
                <i class="fas fa-quote-left me-1"></i>
                <RichTextRenderer :rich-texts="tableBlock.captions" />
            </small>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import RichTextRenderer from '@/components/RichTextRenderer.vue'
import type { TableBlock, RichText } from '@/api/generated/api'

interface Props {
    tableBlock: TableBlock
    showTableInfo?: boolean
}

interface TableData {
    hasRowHeader: boolean
    hasColumnHeader: boolean
    headers: RichText[][]
    rows: RichText[][][]
}

const props = withDefaults(defineProps<Props>(), {
    showTableInfo: true
})

/**
 * 테이블 데이터 파싱 및 구조화
 */
const tableData = computed((): TableData => {
    const tableBlock = props.tableBlock

    // 기본값 설정
    const result: TableData = {
        hasRowHeader: tableBlock.has_row_header || false,
        hasColumnHeader: tableBlock.has_column_header || false,
        headers: [],
        rows: []
    }

    // children이 없으면 빈 테이블 반환
    if (!tableBlock.children || tableBlock.children.length === 0) {
        return result
    }

    // table_row 타입의 자식 블록들만 필터링
    const tableRows = tableBlock.children.filter((child) => child.type === 'table_row')

    if (tableRows.length === 0) {
        return result
    }

    // 각 행을 파싱하여 셀 데이터 추출
    tableRows.forEach((rowBlock, rowIndex) => {
        if (!rowBlock.children) return

        // 각 행의 셀들을 RichText 배열로 변환
        const rowCells = rowBlock.children.map((cellBlock) => cellBlock.text || [])

        // 첫 번째 행이 컬럼 헤더인 경우
        if (result.hasColumnHeader && rowIndex === 0) {
            result.headers = rowCells
        } else {
            result.rows.push(rowCells)
        }
    })

    return result
})

/**
 * 컬럼 수 계산
 */
const getColumnCount = (): number => {
    if (tableData.value.headers.length > 0) {
        return tableData.value.headers.length
    }

    if (tableData.value.rows.length > 0) {
        return Math.max(...tableData.value.rows.map((row) => row.length))
    }

    return 0
}

/**
 * 셀이 비어있는지 확인
 */
const isCellEmpty = (cell: RichText[]): boolean => {
    return !cell || cell.length === 0 || cell.every((richText) => !richText.text?.trim())
}

/**
 * 테이블이 비어있는지 확인
 */
const isTableEmpty = computed((): boolean => {
    return tableData.value.rows.length === 0 && tableData.value.headers.length === 0
})
</script>

<style scoped lang="scss">
.table-block-item {
    margin: 1.5rem 0;

    .table-container {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #dee2e6;
    }

    .table {
        margin-bottom: 0;
        background-color: #fff;

        // 헤더 스타일
        thead.table-dark {
            background-color: #2c3e50;
            border-color: #34495e;

            .table-header-cell {
                color: #ffffff;
                font-weight: 600;
                text-align: center;
                vertical-align: middle;
                padding: 0.75rem;
                border-color: #34495e;

                &:first-child {
                    border-left: none;
                }

                &:last-child {
                    border-right: none;
                }
            }
        }

        // 행 헤더 스타일
        .table-row-header {
            background-color: #f8f9fa;
            font-weight: 600;
            text-align: left;
            vertical-align: top;
            padding: 0.75rem;
            border-color: #dee2e6;
            color: #495057;
            min-width: 120px;
        }

        // 일반 셀 스타일
        .table-cell {
            vertical-align: top;
            padding: 0.75rem;
            border-color: #dee2e6;
            line-height: 1.5;

            &.table-cell-empty {
                background-color: #f8f9fa;
                color: #6c757d;
                font-style: italic;

                &::before {
                    content: '—';
                    opacity: 0.5;
                }
            }
        }

        // 행 호버 효과
        .table-row:hover {
            background-color: rgba(0, 123, 255, 0.05);
        }

        // 테이블 경계선
        th,
        td {
            border-width: 1px;

            &:first-child {
                border-left: none;
            }

            &:last-child {
                border-right: none;
            }
        }

        // 마지막 행 하단 경계선 제거
        tbody tr:last-child {
            th,
            td {
                border-bottom: none;
            }
        }
    }

    // 테이블 정보
    .table-info {
        padding: 0.5rem;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-top: none;
        border-radius: 0 0 8px 8px;

        i {
            color: #6c757d;
        }
    }

    // 캡션
    .table-caption {
        text-align: center;
        font-style: italic;

        i {
            color: #6c757d;
        }
    }
}

// 반응형 디자인
@media (max-width: 768px) {
    .table-block-item {
        .table-container {
            font-size: 0.875rem;
        }

        .table {
            .table-header-cell,
            .table-row-header,
            .table-cell {
                padding: 0.5rem;
            }
        }

        .table-info {
            font-size: 0.75rem;
        }
    }
}

// 작은 화면에서 테이블 스크롤
@media (max-width: 576px) {
    .table-responsive {
        &::-webkit-scrollbar {
            height: 8px;
        }

        &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
    }
}

// 다크 모드 지원
@media (prefers-color-scheme: dark) {
    .table-block-item {
        .table-container {
            border-color: #495057;
        }

        .table {
            background-color: #212529;
            color: #fff;

            .table-row-header {
                background-color: #343a40;
                color: #fff;
                border-color: #495057;
            }

            .table-cell {
                border-color: #495057;

                &.table-cell-empty {
                    background-color: #343a40;
                    color: #adb5bd;
                }
            }

            .table-row:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
        }

        .table-info {
            background-color: #343a40;
            border-color: #495057;
            color: #adb5bd;
        }
    }
}

// 프린트 스타일
@media print {
    .table-block-item {
        .table-container {
            box-shadow: none;
            border: 1px solid #000;
        }

        .table {
            th,
            td {
                border: 1px solid #000;
            }

            .table-row:hover {
                background-color: transparent;
            }
        }

        .table-info {
            display: none;
        }
    }
}
</style>
