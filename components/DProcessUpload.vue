<template>
    <UModal v-model="isOpen">
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h1 class="text-2xl">
                        Upload a process
                    </h1>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
                </div>
            </template>

            <form id="processUploadForm" enctype="multipart/form-data" @submit.prevent="processUpload">
                <UFormGroup label="File">
                    <UInput d="form" ref="file" type="file" accept="application/x-zip-compressed" name="file" required />
                </UFormGroup>
            </form>

            <template #footer>
                <UButton type="submit" form="processUploadForm" label="Submit" />
            </template>
        </UCard>
    </UModal>
    <UButton label="Upload" @click="isOpen = true" />
</template>

<script setup lang="ts">
import { connectStorageEmulator, ref, uploadBytes } from 'firebase/storage';
import { ref as vueref } from 'vue';
const isOpen = vueref(false);

const processUpload = async (event) => {
    console.log(event.target)
    const data = new FormData(event.target)
    console.log([...data.entries()])
    const result  = await $fetch('/api/process', {
        method: 'POST',
        body: data
    })
    console.log(result);
}

const sendFile = async () => {
    const formData = new FormData()
    formData.append('file', uploadFile.value)
    try {
        const data = await $fetch('/api/process', {
            method: 'post',
            body: formData
        })
        // forms.value.push(data)
    } catch (error) {
        console.log(error)
    }
}
</script>