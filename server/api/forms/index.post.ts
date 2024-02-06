import { randomUUID } from 'crypto'
import { setDoc, doc } from 'firebase/firestore'
import { useFirebase } from '~/composables/useFirebase'
import { Form } from '~/types/index'

export default defineEventHandler(async (event) => {
    const { firestore } = useFirebase()
    const uploadfiles = await readMultipartFormData(event)
    if (uploadfiles !== undefined) {
        for (const file of uploadfiles) {
            if (file.type === 'application/json') {
                try {
                    const id = randomUUID()
                    const form = JSON.parse(file.data.toString()) as Form
                    const documentRef = doc(firestore, 'forms', id)
                    setDoc(documentRef, form)
                    const metadataRef = doc(firestore, 'forms-meta', id)
                    const metadata = {
                        id,
                        name: form.name,
                        description: form.description,
                    }
                    setDoc(metadataRef, metadata)
                    return metadata;
                } catch (error) {
                    console.log(error)
                }
            }
        }
    } else {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'The payload is not provided. Please provide multipart form data.' })
    }
})
