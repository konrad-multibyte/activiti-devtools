// import { isContainer, type Form, type FormField, type ConfluenceContainer } from "~/types"

// export const exportConfluence = (form: Form) => {
//     const confluenceTables: ConfluenceContainer[] = []
//     for (const field in form.editorJson.fields) {
//         if (isContainer(field)) {
//            for (const containerFields of Object.values(field.fields)) {
//                 for (const containerField of containerFields) {
//                     let confluenceContainer: ConfluenceContainer = {
//                         title: "",
//                         header: [],
//                         fields: []
//                     }
//                 }
//            }
//         }
//     }
// }