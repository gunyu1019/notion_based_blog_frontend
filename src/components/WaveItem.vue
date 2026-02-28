<script setup lang="ts">
defineProps<{
    type: string
}>()
</script>

<template>
    <div class="wave" :class="`wave-type-${type}`"></div>
</template>

<style scoped lang="scss">
.wave {
    background: url('@/assets/image/wave.svg');
    fill: #ffffff;
    width: 100%;
    height: 198px;
    overflow: hidden;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.05));

    &.wave-type-1 {
        animation: wave-animation1 30s linear infinite;
    }

    &.wave-type-2 {
        transform: rotate(180deg);
        animation: wave-animation2 30s linear infinite;
    }
}

@keyframes wave-animation1 {
    0% {
        background-position-x: 0;
    }
    100% {
        background-position-x: 1600px;
    }
}

@keyframes wave-animation2 {
    0% {
        background-position-x: 1600px;
    }
    100% {
        background-position-x: 0;
    }
}
</style>
