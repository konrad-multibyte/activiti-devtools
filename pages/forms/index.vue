<script setup lang="ts">
import { collection, query, onSnapshot } from 'firebase/firestore'
import { useFirebase } from '~/composables/useFirebase'
import type { FormMeta } from '~/types';

const toast = useToast()

const forms = ref<FormMeta[]>([])
const isFormUploadModalOpen = ref(false)
const uploadFiles = ref<FileList>()

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

onMounted(async () => {
    const { firestore } = useFirebase();
    const q = query(collection(firestore, 'forms-meta'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const form = change.doc.data() as FormMeta;
            forms.value.push(form);
        });
    });
})

const selectFile = (payload: FileList) => {
    uploadFiles.value = payload
}

const sendFile = async () => {
    const data = new FormData()
    if (uploadFiles.value) {
        for (const file of uploadFiles.value) {
            data.append('file', file)
        }
    }
    $fetch('/api/forms', {
        method: 'post',
        body: data
    }).catch((error) => {
        console.error(error)
        toast.add({
            id: 'form_upload_fail',
            title: 'Form upload fail',
            description: `This form could not be uploaded.`,
            icon: 'i-heroicons-exclamation-triangle',
            timeout: 5000
        })
    })
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
            <form id="formUpload" class="flex flex-col space-y-4" enctype="multipart/form-data"
                @submit.prevent="sendFile">
                <NewFunction description="Multiple file upload now supported." />
                <UFormGroup label="Files">
                    <UInput d="form" ref="file" type="file" accept="application/json" name="file" multiple required
                        @change="selectFile" />
                </UFormGroup>
            </form>
            <template #footer>
                <UInput type="submit" form="formUpload" model-value="Upload" @click="isFormUploadModalOpen = false" />
            </template>
        </UCard>
    </UModal>
    <UButton label="Upload form" @click="isFormUploadModalOpen = true" />
    <div v-if="forms.length > 0" class="grid grid-cols-4 gap-5 sm:no-grid">
        <UCard v-for="form in forms" :key="form.id" class="">
            <template #header>
                <h1 class="text-xl">{{ form.name }}</h1>
            </template>
            <p v-if="form.description" class="text-base">{{ form.description }}</p>
            <p v-else class="text-base italic">No description available.</p>
            <template #footer>
                <ULink :to="`/forms/${form.id}`">
                    <UButton>Open</UButton>
                </ULink>
            </template>
        </UCard>
    </div>
    <div v-else class="flex items-center justify-center h-96">
        <p class="text-xl italics">There are no forms.</p>
    </div>
</template>