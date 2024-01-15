<script lang="ts" setup>
import { ref, Ref } from 'vue'
import type { PostItem } from '@/types/PostItem'

const props = defineProps<{
    title: String
    titleIcon?: String
    content: PostItem[]
}>()

const initImageIndex = Math.floor(Math.random() * props.content.length)
const showImageIndex: Ref<number> = ref(initImageIndex)
const contentLength = props.content.length
</script>

<template>
    <div class="card-list">
        <h2 v-if="title !== undefined">
            <font-awesome-icon :icon="titleIcon" v-if="titleIcon !== undefined" />{{ title }}
        </h2>
        <template v-for="(item, index) in content" :key="item.id">
            <img
                class="card-image"
                v-if="item.thumbnail_url !== null && index == showImageIndex"
                :src="item.thumbnail_url"
                :style="{
                    'grid-row':
                        contentLength - index <= 2
                            ? `${contentLength - 2}/${contentLength + 1}`
                            : `${index + 1}/${index + 4}`
                }"
            />
            <a
                class="card-item"
                :href="`/post/${item.id}`"
                v-bind:class="{
                    hovered:
                        (contentLength - index <= 3 &&
                            contentLength - 2 <= showImageIndex &&
                            showImageIndex < contentLength &&
                            item.thumbnail_url !== null) ||
                        (showImageIndex <= index &&
                            index <= showImageIndex + 2 &&
                            item.thumbnail_url !== null),
                    hovered_point: showImageIndex == index
                }"
                @mouseleave="showImageIndex = initImageIndex"
                @mouseover="showImageIndex = index"
                >{{ item.title }}<span class="border-line"
            /></a>
        </template>
    </div>
</template>

<style lang="scss" scoped>
div.card-list {
    border: #4a4a4a solid 3px;
    border-radius: 10px;
    display: grid;
    padding: 10px 10px;
    grid-auto-flow: row;
    grid-template-columns: 160px;

    h2 {
        display: flex;
        font-weight: bold;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;

        svg {
            font-size: 24px;
        }
    }

    a.card-item {
        color: #e2e2e2;
        text-decoration: none;
        text-overflow: ellipsis;
        overflow: hidden;
        padding: 2px 6px;
        max-lines: 1;
        grid-column: 1/3;
        transition: padding 0.3s linear;
        white-space: nowrap;

        .border-line {
            background: #4a4a4a;
            border-radius: 0.5px;
            display: block;
            height: 1px;
            width: 100%;
        }

        &:last-child .border-line {
            display: none;
        }

        &.hovered {
            grid-column: 2/2;
        }

        &.hovered_point {
            padding: 6px 6px;
        }
    }

    img.card-image {
        border-radius: 10px;
        max-height: 90px;
        object-fit: scale-down;
        padding: 5px 0;
        grid-column: 1/1;
        margin: auto;
        width: 160px;
    }
}
</style>
