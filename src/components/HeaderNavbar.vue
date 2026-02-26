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
    z-index: 1000;
    position: fixed;
    top: 0;
    width: 100%;
    background: #ffffff;
    border-bottom: 1px solid #f1f3f4;
    padding: 12px 0;

    .navbar-brand {
        padding: 8px 16px;
        color: #212529 !important;
        font-size: 22px;
        font-weight: 700;
        text-decoration: none;

        &:hover {
            color: #495057 !important;
        }
    }

    .nav-item {
        padding: 8px 8px;
        font-size: 15px;

        :deep(a.nav-link) {
            display: inline-block;
            position: relative;
            color: #495057 !important;
            font-weight: 500;
            padding: 8px 16px;
            transition: color 0.2s ease;

            &:hover {
                color: #212529 !important;
            }

            &.active {
                color: #212529 !important;
                font-weight: 600;
            }
        }

        :deep(a.nav-link):after {
            content: '';
            position: absolute;
            width: 100%;
            transform: scaleX(0);
            height: 2px;
            bottom: 4px;
            left: 0;
            background-color: #212529;
            transform-origin: bottom right;
            transition: transform 0.25s ease-out;
        }

        :deep(a.nav-link):hover:after,
        :deep(a.nav-link.active):after {
            transform: scaleX(1);
            transform-origin: bottom left;
        }
    }
}

// 모바일 반응형
@media (max-width: 991.98px) {
    .navbar {
        .navbar-brand {
            font-size: 20px;
        }

        .nav-item {
            :deep(a.nav-link) {
                padding: 12px 16px;
                border-bottom: 1px solid #f1f3f4;

                &:last-child {
                    border-bottom: none;
                }
            }
        }
    }
}
</style>
