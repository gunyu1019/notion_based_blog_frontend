<script lang="ts" setup>
import { RouterLink, RouterView } from 'vue-router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import HeaderNavbar from '@/components/HeaderNavbar.vue'
</script>

<template>
    <HeaderNavbar />
    <RouterView />
</template>

<style lang="scss" scoped></style>
