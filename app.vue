<script setup lang="ts">
import { ru } from '@nuxt/ui/runtime/locale/index.js';
</script>

<template>
    <UApp :locale="ru">
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
