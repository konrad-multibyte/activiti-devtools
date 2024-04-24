<script setup lang="ts">
const processes = ref([])
onMounted(() => {
    
})
</script>

<template>
    <h1 class="text-2xl">
        Processes
    </h1>
    <template v-if="processes.length > 0">

    </template>
    <div v-else class="flex justify-center">
        <h1>No processes found.</h1>
    </div>
</template>