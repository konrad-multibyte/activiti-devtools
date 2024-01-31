import type { Form, ConfluenceContainer, FormField, FormFieldOption } from "~/types"

const getFormComponent = (formComponentName: string) => {
    return formComponentName.toLowerCase().replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase()).replaceAll('_', ' ').replaceAll('-', ' ')
}

const getOptions = (fieldOptions: FormFieldOption[]) => {
    
}

export const useConfluence = (form: Form) => {
    const confluenceTables: ConfluenceContainer[] = []
    for (const field of form.editorJson.fields) {
        if (field.fieldType === 'ContainerRepresentation') {
            let confluenceContainer: ConfluenceContainer = {
                title: field.name ? field.name : '',
                fields: []
            }
            for (const containerFields of Object.values(field.fields)) {
                for (const containerField of containerFields as FormField[]) {
                confluenceContainer.fields.push({
                    labelId: containerField.id,
                    label: containerField.name ? containerField.name : '',
                    placeholder: containerField.placeholder ? containerField.placeholder : '',
                    pdfLabel: '',
                    formComponent: getFormComponent(containerField.type),
                    options: '',
                    displayed: '',
                    required: false,
                    prepopulated: "",
                    prepopulatedFrom: "",
                    prepopulatedEditable: "",
                    notes: ""
                })
                }
            }
            confluenceTables.push(confluenceContainer)
        }
    }
    return confluenceTables
}