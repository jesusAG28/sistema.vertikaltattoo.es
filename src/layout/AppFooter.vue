<script setup>
import { useLayout } from '@/layout/composables/layout';

const { isDarkTheme } = useLayout();
</script>

<template>
    <div class="layout-footer">
        <div class="footer-logo-container">
            <!-- <img :src="`/layout/images/logo-${isDarkTheme ? 'white' : 'dark'}.svg`" alt="poseidon-layout" /> -->
            <span class="footer-app-name">FETLPA</span>
        </div>
        <span class="footer-copyright">Powered with 💟 by &#169; Conwork </span>
    </div>
</template>
