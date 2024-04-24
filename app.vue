<script setup lang="ts">
const links = [
    {
        label: "Forms",
        to: "/forms"
    },
    {
        label: 'Processes',
        to: '/process'
    },
]
</script>

<template>
    <main class="space-y-4 my-5">
        <UHorizontalNavigation :links="links" />
        <NuxtPage />
    </main>
</template>
