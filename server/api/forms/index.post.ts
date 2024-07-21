import { randomUUID } from 'crypto'
import { firestore } from '~/server/utils/firebase'
import { Form } from '~/types/index'

export default defineEventHandler(async (event) => {
    const files = await readMultipartFormData(event);
    if (files) {
        for (const file of files) {
            if (file.type === 'application/json') {
                const id = randomUUID();
                const form = JSON.parse(file.data.toString()) as Form
                const formRef = firestore.doc(`forms/${id}`);
                formRef.create(form);
                const metaRef = firestore.doc(`forms-meta/${id}`);
                const meta = {
                    id,
                    name: form.name,
                    descripton: form.description
                }
                metaRef.create(meta);
            }
        }
        setResponseStatus(event, 201, 'Created');
    } else {
        setResponseStatus(event, 400, 'Bad Request');
    }
})
