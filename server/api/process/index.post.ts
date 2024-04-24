import { unzip } from 'node:zlib'
import 'tar'

function handleProcessFiles(error: Error | null, buffer: Buffer) {
    console.log(buffer)
}

export default defineEventHandler(async (event) => {
    const files = await readMultipartFormData(event)
    if (files == null) {
        return { status: 'error', message: 'There are not files to be processed.'}
    } else {
        for (const file of files) {
            if (file.type === 'application/x-zip-compressed') {
                // console.log(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
                if (file.data.compare(Buffer.from([0x50, 0x4b, 0x03, 0x04])) === 1) {
                    unzip(file.data, handleProcessFiles);
                } else {
                    return { status: 'error', message: 'The file signature is incorrect.', id: null, name: null }
                }
            } else {
                return { status: 'error', message: 'The requested file is not zip format. (application/x-zip-compressed)', id: null, name: null }
            
            }
        }
    }
});