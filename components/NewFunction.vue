<script setup lang="ts">
const props = defineProps({
    description: {
        type: String,
        required: true
    }
})
</script>

<template>
    <div class="flex items-center space-x-2">
        <UBadge class="text-sm">New</UBadge>
        <p class="text-sm">{{ props.description }}</p>
    </div>
</template>