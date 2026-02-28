<template>
    <div class="notion-block" :class="`notion-block-${block.type}`">
        <!-- Heading 블록들 -->
        <h1 v-if="block.type === 'heading_1'" class="mb-3">
            <RichTextRenderer :rich-texts="block.text || []" />
        </h1>

        <h2 v-else-if="block.type === 'heading_2'" class="mb-3">
            <RichTextRenderer :rich-texts="block.text || []" />
        </h2>

        <h3 v-else-if="block.type === 'heading_3'" class="mb-3">
            <RichTextRenderer :rich-texts="block.text || []" />
        </h3>

        <!-- 코드 블록 -->
        <div v-else-if="block.type === 'code'" class="mb-4">
            <div
                class="d-flex justify-content-between align-items-center bg-dark text-light px-3 py-2 rounded-top"
            >
                <span class="badge bg-secondary">{{ getCodeLanguage() }}</span>
                <i class="fas fa-code"></i>
            </div>
            <pre
                class="bg-light border rounded-bottom mb-0 p-3"
            ><code>{{ getCodeText() }}</code></pre>
            <div v-if="block.captions && block.captions.length > 0" class="text-muted small mt-1">
                <RichTextRenderer :rich-texts="block.captions" />
            </div>
        </div>

        <!-- 테이블 블록 -->
        <div v-else-if="block.type === 'table'" class="mb-4">
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead v-if="getTableData().hasColumnHeader" class="table-dark">
                        <tr>
                            <th
                                v-for="(cell, index) in getTableData().headers"
                                :key="`header-${index}`"
                                scope="col"
                            >
                                <RichTextRenderer :rich-texts="cell || []" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIndex) in getTableData().rows" :key="`row-${rowIndex}`">
                            <template
                                v-for="(cell, cellIndex) in row"
                                :key="`cell-${rowIndex}-${cellIndex}`"
                            >
                                <th
                                    v-if="getTableData().hasRowHeader && cellIndex === 0"
                                    scope="row"
                                    class="table-secondary"
                                >
                                    <RichTextRenderer :rich-texts="cell || []" />
                                </th>
                                <td v-else>
                                    <RichTextRenderer :rich-texts="cell || []" />
                                </td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="block.captions && block.captions.length > 0" class="text-muted small">
                <RichTextRenderer :rich-texts="block.captions" />
            </div>
        </div>

        <!-- URL 블록 -->
        <div v-else-if="block.type === 'bookmark' || block.type === 'link_preview'" class="mb-4">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-link text-primary me-2"></i>
                        <div class="flex-grow-1">
                            <a
                                :href="getUrlBlockUrl()"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="card-title h6 mb-1"
                            >
                                {{ getUrlBlockUrl() }}
                            </a>
                            <div v-if="block.text && block.text.length > 0" class="text-muted">
                                <RichTextRenderer :rich-texts="block.text" />
                            </div>
                        </div>
                        <i class="fas fa-external-link-alt text-muted"></i>
                    </div>
                </div>
            </div>
            <div v-if="block.captions && block.captions.length > 0" class="text-muted small mt-1">
                <RichTextRenderer :rich-texts="block.captions" />
            </div>
        </div>

        <!-- 파일 블록 -->
        <div v-else-if="block.type === 'file'" class="mb-4">
            <div class="card border-success">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-file-download text-success me-2"></i>
                        <div class="flex-grow-1">
                            <h6 class="card-title mb-1">
                                <RichTextRenderer :rich-texts="block.text || []" />
                            </h6>
                            <button
                                v-if="getFileBlockUrl()"
                                @click="downloadFile"
                                class="btn btn-outline-success btn-sm"
                            >
                                <i class="fas fa-download me-1"></i>
                                다운로드
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="block.captions && block.captions.length > 0" class="text-muted small mt-1">
                <RichTextRenderer :rich-texts="block.captions" />
            </div>
        </div>

        <!-- 이미지 블록 -->
        <div v-else-if="block.type === 'image'" class="mb-4 text-center">
            <img
                v-if="getFileBlockUrl()"
                :src="getFileBlockUrl()"
                class="img-fluid rounded shadow-sm"
                :alt="getImageAlt()"
            />
            <div v-if="block.captions && block.captions.length > 0" class="text-muted small mt-2">
                <RichTextRenderer :rich-texts="block.captions" />
            </div>
        </div>

        <!-- 리스트 블록들 -->
        <ul v-else-if="block.type === 'bulleted_list_item'" class="mb-2">
            <li>
                <RichTextRenderer :rich-texts="block.text || []" />
            </li>
        </ul>

        <ol v-else-if="block.type === 'numbered_list_item'" class="mb-2">
            <li>
                <RichTextRenderer :rich-texts="block.text || []" />
            </li>
        </ol>

        <!-- Quote 블록 -->
        <blockquote
            v-else-if="block.type === 'quote'"
            class="blockquote border-start border-4 border-secondary ps-3 mb-4"
        >
            <p class="mb-0">
                <RichTextRenderer :rich-texts="block.text || []" />
            </p>
        </blockquote>

        <!-- Callout 블록 -->
        <div v-else-if="block.type === 'callout'" class="alert alert-info mb-4">
            <i class="fas fa-info-circle me-2"></i>
            <RichTextRenderer :rich-texts="block.text || []" />
        </div>

        <!-- 일반 문단 (paragraph) 및 기타 텍스트 블록 -->
        <p v-else class="mb-3">
            <RichTextRenderer :rich-texts="block.text || []" />
        </p>

        <!-- 하위 블록들 재귀 렌더링 -->
        <div
            v-if="block.has_children && block.children && block.children.length > 0"
            class="ms-4 mt-2"
        >
            <NotionBlock v-for="child in block.children" :key="child.id" :block="child" />
        </div>
    </div>
</template>

<script setup lang="ts">
import RichTextRenderer from './RichTextRenderer.vue'
import type { Block, CodeBlock, TableBlock, UrlBlock, FileBlock } from '@/api/generated/api'

interface Props {
    block: Block | CodeBlock | TableBlock | UrlBlock | FileBlock
}

const props = defineProps<Props>()

/**
 * 코드 블록의 언어 정보 추출
 */
const getCodeLanguage = (): string => {
    if ('language' in props.block) {
        return props.block.language || 'text'
    }
    return 'text'
}

/**
 * 코드 블록의 텍스트 내용 추출
 */
const getCodeText = (): string => {
    if (props.block.text && props.block.text.length > 0) {
        return props.block.text.map((t) => t.text).join('')
    }
    return ''
}

/**
 * 테이블 블록의 데이터 파싱
 */
const getTableData = () => {
    if (
        props.block.type === 'table' &&
        'has_row_header' in props.block &&
        'has_column_header' in props.block
    ) {
        const tableBlock = props.block as TableBlock

        // 실제 테이블 데이터 파싱 로직
        // children 배열에서 table_row 타입의 블록들을 찾아 행 데이터로 변환
        const rows: any[][] = []
        let headers: any[] = []

        if (props.block.children) {
            props.block.children.forEach((child, index) => {
                if (child.type === 'table_row' && child.children) {
                    const row = child.children.map((cell) => cell.text || [])

                    if (tableBlock.has_column_header && index === 0) {
                        headers = row
                    } else {
                        rows.push(row)
                    }
                }
            })
        }

        return {
            hasRowHeader: tableBlock.has_row_header,
            hasColumnHeader: tableBlock.has_column_header,
            headers,
            rows
        }
    }

    return {
        hasRowHeader: false,
        hasColumnHeader: false,
        headers: [],
        rows: []
    }
}

/**
 * URL 블록의 URL 추출
 */
const getUrlBlockUrl = (): string => {
    if ('url' in props.block) {
        return props.block.url || ''
    }
    return ''
}

/**
 * 파일 블록의 파일 URL 추출
 */
const getFileBlockUrl = (): string => {
    if ('file' in props.block && props.block.file) {
        return props.block.file.url || ''
    }
    return ''
}

/**
 * 이미지 alt 텍스트 생성
 */
const getImageAlt = (): string => {
    if (props.block.captions && props.block.captions.length > 0) {
        return props.block.captions.map((c) => c.text).join('')
    }
    return '이미지'
}

/**
 * 파일 다운로드 처리
 */
const downloadFile = () => {
    const fileUrl = getFileBlockUrl()
    if (fileUrl) {
        window.open(fileUrl, '_blank')
    }
}
</script>

<style scoped>
.notion-block {
    font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, 'Apple Color Emoji', Arial,
        sans-serif, 'Segoe UI Emoji', 'Segoe UI Symbol';
}

.notion-block pre {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    background-color: #f8f9fa;
    overflow-x: auto;
}

.notion-block blockquote {
    font-style: italic;
    color: #6c757d;
}

.notion-block .table th,
.notion-block .table td {
    vertical-align: top;
    border-color: #dee2e6;
}

.notion-block ul,
.notion-block ol {
    padding-left: 1.5rem;
}

.notion-block img {
    max-width: 100%;
    height: auto;
}
</style>
