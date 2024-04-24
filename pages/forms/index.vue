<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { useFirebase } from '~/composables/useFirebase'
import type { FormMeta } from '~/types';

const forms = ref<FormMeta[]>([])
const uploadFile = ref<File>({
    lastModified: 0,
    name: '',
    webkitRelativePath: '',
    size: 0,
    type: '',
    arrayBuffer: function (): Promise<ArrayBuffer> {
        throw new Error('Function not implemented.');
    },
    slice: function (start?: number | undefined, end?: number | undefined, contentType?: string | undefined): Blob {
        throw new Error('Function not implemented.');
    },
    stream: function (): ReadableStream<Uint8Array> {
        throw new Error('Function not implemented.');
    },
    text: function (): Promise<string> {
        throw new Error('Function not implemented.');
    }
})
const isFormUploadModalOpen = ref(false)

useHead({
    title: 'Forms - Activiti Devtools',
    link: [
        {
            rel: 'dns-prefetch',
            href: 'https://firestore.googleapis.com'
        },
        {
            rel: 'preconnect',
            href: 'https://firestore.googleapis.com'
        }
    ]
})

const getForms = async () => {
    const { firestore } = useFirebase();
    const querySnapshot = await getDocs(collection(firestore, 'forms-meta'))
    forms.value = querySnapshot.docs.map(doc => doc.data() as FormMeta)
}

onMounted(async () => {
    await getForms();
})

const selectFile = (payload: Event) => {
    const target = payload.target as HTMLInputElement
    if (target.files != null) {
        uploadFile.value = target.files[0] as File
    }
}

const sendFile = async () => {
    const formData = new FormData()
    formData.append('file', uploadFile.value)
    try {
        const data = await $fetch('/api/forms', {
            method: 'post',
            body: formData
        })
        console.log(formData);
        forms.value.push(data)
    } catch (error) {
        console.log(error)
    }
}
</script>

<template>
    <UModal v-model="isFormUploadModalOpen">
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                        Upload
                    </h3>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                        @click="isFormUploadModalOpen = false" />
                </div>
            </template>
            <form id="formUpload" enctype="multipart/form-data" @submit.prevent="sendFile">
                <UFormGroup label="File">
                    <UInput d="form" ref="file" type="file" accept="application/json" name="file" required
                        @change="selectFile" />
                </UFormGroup>
            </form>
            <template #footer>
                <UInput type="submit" form="formUpload" model-value="Upload" @click="isFormUploadModalOpen = false" />
            </template>
        </UCard>
    </UModal>
    <UButton label="Upload form" @click="isFormUploadModalOpen = true" />
    <div class="grid grid-cols-4 gap-5 sm:no-grid">
        <UCard v-for="form in forms" :key="form.id" class="">
            <template #header>
                <h1 class="text-xl">
                    {{ form.name }}
                </h1>
                <!-- <p class="text-sm">{{ form.id }}</p> -->
            </template>
            <p v-if="form.description == null || form.description == ''" class="italic">No description provided.</p>
            <p v-else class="italic">{{ form.description }}</p>
            <template #footer>
                <ULink class="btn btn-primary" :to="`/forms/${form.id}`">Open</ULink>
            </template>
        </UCard>
    </div>
</template>