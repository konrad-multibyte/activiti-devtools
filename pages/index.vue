<template>
    <UPageHeader
        headline=""
        title="Activiti Toolkit"
        description="Toolkit for all Activiti activities."
    />
    <UPageGrid>
        <UPageCard v-for="(module, index) in modules" :key="index" v-bind="module" target="_blank">
            <template #description>
                <span class="line-clamp-2">{{ module.description }}</span>
            </template>
        </UPageCard>
  </UPageGrid>
</template>

<script setup lang="ts">
useHead({
    title: 'Activiti Devtools'
})
const modules = [
    {
        title: 'Forms',
        description: '',
        to: '/forms',
        icon: 'i-heroicons-pencil-square'
    },
    {
        title: 'HTML minifier',
        description: 'Made by Kangax',
        to: 'https://kangax.github.io/html-minifier/',
         icon: 'i-heroicons-code-bracket'
    },
    {
        title: 'JSON Path Finder',
        description: 'Made by Joe Beach',
        to: 'https://jsonpathfinder.com/',
        icon: 'i-heroicons-document-magnifying-glass'
    }
]
</script>