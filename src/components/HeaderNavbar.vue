<script lang="ts" setup></script>

<template>
    <BNavbar toggleable="lg" container="true">
        <BNavbarBrand href="https://yhs.kr/">건유1019</BNavbarBrand>
        <BNavbarToggle target="nav-collapse" />
        <BCollapse id="nav-collapse" is-nav>
            <BNavbarNav class="ms-auto mb-2 mb-lg-0">
                <BNavItem href="https://yhs.kr/">Home</BNavItem>
                <BNavItem href="https://yhs.kr/#about">About</BNavItem>
                <BNavItem href="https://yhs.kr/#team">Team</BNavItem>
                <BNavItem href="https://yhs.kr/projects">Projects</BNavItem>
                <BNavItem active href="https://blog.yhs.kr">Blog</BNavItem>
            </BNavbarNav>
        </BCollapse>
    </BNavbar>
</template>

<style lang="scss" scoped>
.navbar {
    z-index: 1;
    position: fixed;
    top: 0;
    width: 100%;

    background: #1e212580;

    .navbar-brand {
        padding: 5px 8px 5px 8px;
        color: white;
        font-size: 20px;
        font-weight: bold;
    }

    .nav-item {
        padding: 8px 5px 8px 5px;
        font-size: 15px;

        :deep(a.nav-link) {
            display: inline-block;
            position: relative;
            color: #dedede !important;
            font-weight: 600;
        }

        :deep(a.nav-link):after {
            content: '';
            position: absolute;
            width: 100%;
            transform: scaleX(0);
            height: 2px;
            bottom: 0;
            left: 0;
            background-color: #dedede !important;
            transform-origin: bottom right;
            transition: transform 0.25s ease-out;
        }

        :deep(a.nav-link):hover:after {
            transform: scaleX(1);
            transform-origin: bottom left;
        }
    }
}
</style>
