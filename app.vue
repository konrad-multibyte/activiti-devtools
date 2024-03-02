<script setup lang="ts">
const links = [
    {
        label: "Forms",
        to: "/forms"
    }
]
</script>

<template>
    <main class="space-y-4">
        <UHorizontalNavigation :links="links" />
        <NuxtPage />
    </main>
</template>
