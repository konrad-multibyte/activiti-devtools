<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { useFirebase } from '~/composables/useFirebase'
import type { FormMeta } from '~/types';

const forms = ref<FormMeta[]>()
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

onMounted(async () => {
    const { firestore } = useFirebase();
    const querySnapshot = await getDocs(collection(firestore, 'forms-meta'))
    forms.value = querySnapshot.docs.map(doc => doc.data() as FormMeta)
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
        await $fetch('/api/forms', {
            method: 'post',
            body: formData
        })
    } catch (error) {
        console.log(error)
    }
    refreshNuxtData('getFormsForFormDisplay')
}
</script>

<template>
    <main>
        <div class="form-upload">
            <form action="" enctype="multipart/form-data" @submit.prevent="sendFile">
                <div class="field">
                    <label for="form">Upload form</label>
                    <input id="form" ref="file" type="file" accept="application/json" name="file" required
                        @change="selectFile">
                </div>
                <div class="field">
                    <button type="submit" class="button button-primary">
                        Upload
                    </button>
                </div>
            </form>
        </div>
        <div class="form-menu">
            <h1>Forms</h1>
            <div class="card-nav">
                <a v-for="form in forms" :key="form.id" class="card" :href="`/forms/${form.id}`">
                    <h3>{{ form.name }}</h3>
                    <p v-if="form.description == null || form.description == ''" class="italic">No description provided.</p>
                    <p v-else class="italic">{{ form.description }}</p>
                    <small>{{ form.id }}</small>
                </a>
            </div>
        </div>
    </main>
</template>