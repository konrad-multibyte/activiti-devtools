<script setup lang="ts">
import { doc, onSnapshot } from 'firebase/firestore';
import type { ConfigurableInputTableVisibilityCondition, Form, VisiblityCondition } from '~/types/index'

const route = useRoute()
const id = route.params.id as string
const isMounted =  ref(false)
const tables = ref([])
const form = ref<Form>(
    {
        referenceId: '',
        name: '',
        description: '',
        editorJson: {
            tabs: undefined,
            fields: [],
            outcomes: [],
            javascriptEvents: [],
            className: '',
            style: '',
            metadata: {},
            variables: [],
            customFieldsValueInfo: {},
            gridsterForm: false
        }
    }
)
const links = [
    {
        label: "Form",
        to: `/forms/${id}`
    }
]

useHead(
    {
        title: `Form - Activiti Devtools`,
        link: [
            {
                rel: 'preconnect',
                href: 'https://firestore.googleapis.com'
            }
        ]
    }
)

onMounted(async () => {
    const { firestore } = useFirebase();
    const docRef = doc(firestore, 'forms', id);
    onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (data != undefined) {
            form.value = data as Form
        }
        useConfluence(data as Form)
        useHead(
            {
                title: `${form.value.name} - Activiti Devtools`
            }
        )
        for (const field of form.value.editorJson.fields) {
            let table = {
                name: '',
                className: '',
                rows: []
            }
            if (field.fieldType == 'ContainerRepresentation') {
                if (field.type === 'group') {
                    if (field.name) table.name = field.name    
                } else if (field.type === 'container') {
                    table.name = ''
                } else {
                    if (field.name) table.name = field.name
                }
                if (field.className) {
                    table.className = field.className
                } else {
                    table.className = ''
                }
                for (const [index, value] of Object.entries(field.fields)) {
                    for (const containerField of value) {
                         table.rows.push({
                            'Field Id': containerField.id,
                            'Label': `${containerField.name ? containerField.name : '' }${containerField.displayText ? containerField.displayText : '' }`,
                            'PDF Label': '',
                            'Placeholder': `${containerField.placeholder ? containerField.placeholder : containerField.value ? containerField.value : ''}`,
                            'Form Component': capitalize(containerField.type.replaceAll('_', ' ').replaceAll('-', ' ')),
                            'Options': unpackOptions(containerField.options),
                            'Displayed?': isFormControlDisplayed(containerField, field),
                            'Required or optional?': containerField.required ? 'Required' : 'Optional',
                            'Notes': displayNotes(containerField)
                        })
                    }
                }
            }
            tables.value.push(table)
        }
        isMounted.value = true
    })
})

function capitalize(string: string, lower = false) {
    return (lower ? string.toLowerCase() : string).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase())
}

function unpackVisibilityConditions(nestedVisibilityCondition: VisiblityCondition | null | undefined) {
    const conditions = []
    while (nestedVisibilityCondition !== null) {
        conditions.push(nestedVisibilityCondition)
        nestedVisibilityCondition = nestedVisibilityCondition?.nextCondition
    }
    return conditions
}

function highlightField(id: string) {
    const card = document.getElementById(id)
    if (card) {
        card.animate(
            [
                {
                    boxShadow: '0 0 10px var(--red)'
                },
                {
                    boxShadow: 'none'
                }
            ],
            {
                duration: 2000,
                iterations: 1
            }
        )
    }
}

function unpackOptions(options) {
    if (options) {
        return options.map((option) => option.name).join(' ')
    }
    return null
}

function transformCamelCase(text: string) {
    const result = text.replace(/([A-Z])/g, ' $1')
    return result.charAt(0).toUpperCase() + result.slice(1)
}

function configurableTableInputFieldVisibility(visibilityConditions: ConfigurableInputTableVisibilityCondition[] | null | undefined, parentClassName: string, isHidden: boolean | null | undefined) {
    const conditions = []
    if (visibilityConditions != null) {
        for (const condition of visibilityConditions) {
            conditions.push(`${condition.controlId}${condition.processVariable}${condition.tableControlId} ${condition.operand}${condition.condition} ${condition.value} ${condition.nextConditionOperator ? `\n${condition.nextConditionOperator}`: ''}`)
        }
        return conditions.join('\n')
    } else if (isHidden) {
        return 'Hidden'
    } else if (parentClassName === 'hidden-control') {
        return 'Hidden'
    } else {
        return 'Always'
    }
}

function isFormControlDisplayed(formControl, parent) {
    if (formControl.visibilityCondition) {
        const conditions = []
        for (const condition of unpackVisibilityConditions(formControl.visibilityCondition)) {
            conditions.push(`If ${condition?.leftFormFieldId}${condition?.leftRestResponseId} ${condition?.operator} ${condition?.rightFormFieldId}${condition?.rightRestResponseId}${condition?.rightType ? condition.rightType : ''}${condition?.rightValue} ${condition?.nextCondition ? `\n${condition.nextCondition}`: ''}`)
        }
        return conditions.join('\n')
    } else if (parent.className && parent.className.includes('hidden-control')) {
        return 'Hidden'
    } else if (formControl.className && formControl.className.includes('hidden-control')) {
        return 'Hidden'
    }
    return 'Always'
}

function displayNotes(formControl) {
    if (formControl.params.customProperties || formControl.hyperlinkUrl) {
        const props = []
        if (formControl.params.customProperties) {
            for (const [key, value] of Object.entries(formControl.params.customProperties)) {
                props.push(`${key}: ${value}\n`)
            }
        }
        if (formControl.hyperlinkUrl) {
            if (props.length > 0) {
                props.push(formControl.hyperlinkUrl) 
            } else {
                return formControl.hyperlinkUrl
            }
        }
        if (props.length > 0 && props.join(' ').length < 280) {
            return props.join(' ')
        }
    }
    return ''
}

</script>

<template>
    <div class="form-header">
        <h1 class="text-2xl">
            {{ form.name }}
        </h1>
    </div>
    <UHorizontalNavigation :links="links" />
    <div v-if="isMounted" v-for="table of tables">
        <div class="header">
            <h1 class="text-xl">
                {{ table.name }}
            </h1>
            <p>
                {{ table.className }}
            </p>
        </div>
        <UTable :rows="table.rows" />
    </div>
    <USkeleton v-else class="w-full" style="width: 100%" />
</template>
