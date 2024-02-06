<script setup lang="ts">
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import type { Form, VisiblityCondition } from "~/types/index.d.js"

useHead({
    title: `Form - Activiti Devtools`,
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

const route = useRoute();
const id = route.params.id as string
const expandedFields = ref<string[]>([])
const selectedTab = ref<string>('tab1')
const form = ref<Form>({
    referenceId: "",
    name: "",
    description: "",
    editorJson: {
        tabs: undefined,
        fields: [],
        outcomes: [],
        javascriptEvents: [],
        className: "",
        style: "",
        metadata: {},
        variables: [],
        customFieldsValueInfo: {},
        gridsterForm: false
    }
})

onMounted(async () => {
    const { firestore } = useFirebase();
    const docRef = doc(firestore, 'forms', id);
    onSnapshot(docRef, (snap) => {
        const data = snap.data();
        if (data != undefined) {
            form.value = data as Form
            useHead({
                title: `${form.value.name} - Activiti Devtools`
            });
        }
    });
})

const removeForm = async () => {
    const { firestore } = useFirebase();
    const router  = useRouter();
    await deleteDoc(doc(firestore, 'forms', id))
    await deleteDoc(doc(firestore, 'forms-meta', id))
    router.push('/forms');
}

const selectTab = async (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.dataset.tabId != null) {
        selectedTab.value = target.dataset.tabId
    }
    const activeTab = document.querySelector('.tab.active')
    activeTab?.classList.remove('active')
    target.classList.add('active')

}

const capitalize = (text: string, lower = false) => {
    return (lower ? text.toLowerCase() : text).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase())
}

const expandField = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.dataset.fieldId != null) {
        const selectedFieldId = target.dataset.fieldId
        if (expandedFields.value.includes(selectedFieldId)) {
            const index = expandedFields.value.indexOf(selectedFieldId)
            expandedFields.value.splice(index, 1)
            target.classList.remove('rotate-90')
            target.classList.add('rotate-90-reverse')
        } else {
            expandedFields.value.push(selectedFieldId)
            target.classList.remove('rotate-90-reverse')
            target.classList.add('rotate-90')
        }
    }
}

const highlightField = (id: string) => {
    const card = document.getElementById(id)
    if (card != null) {
        card.animate(
            [
                {
                    border: '1px solid var(--reder)',
                    boxShadow: '0 0 5px var(--red)'
                },
                {
                    border: '1px solid #e8edf1'
                }
            ],
            {
                duration: 2000,
                iterations: 1
            }
        )
    }
}

function unpackVisibilityConditions(nestedVisibilityCondition: VisiblityCondition | null) {
    const conditions = []
    let nextVisibilityCondition = null
    if (nestedVisibilityCondition != null) {
        do {
            conditions.push(nestedVisibilityCondition)
            nextVisibilityCondition = nestedVisibilityCondition?.nextCondition
        } while (nextVisibilityCondition != null)
    }
    return conditions
}

</script>

<template>
    <main>
        <h1>{{ form.name }}</h1>
        <p v-if="form.description != null || form.description !== ''" class="italic">No description provided.</p>
        <p v-else class="italic">{{ form.description }}</p>
        <div class="button-group-horizontal">
            <a class="button button-primary" :href="`/forms/${id}/document`">
                Confluence
            </a>
            <button class="button button-danger" @click="removeForm">
                Delete
            </button>
        </div>
        <div v-if="form.editorJson?.tabs" class="tabs">
            <div v-for="(tab, index) in form.editorJson.tabs" :class="`tab ${index === 0 ? 'active' : ''}`"
                :data-tab-id="tab.id" @click="selectTab">
                {{ tab.title }}
            </div>
        </div>
        <div class="form-preview-representation">
            <div v-for="field of form.editorJson.fields" :key="field.id">
                <div v-if="field.tab">
                    <div v-if="field.tab === selectedTab">
                        <h3>{{ field.name }}</h3>
                        <p>class: {{ field.className }}</p>
                        <div v-if="field.type === 'group'">
                            <div v-for="childFieldCollection of field.fields" :key="childFieldCollection.id">
                                <div v-if="childFieldCollection.length > 0">
                                    <div class="card-stack">
                                        <div v-for="childField of childFieldCollection" :id="childField.id"
                                            :key="childField.id" class="card">
                                            <img class="button-expand" src="~/assets/svg/arrowdown.svg" alt="Expand button"
                                                :data-field-id="`${childField.id}`" @click="expandField">
                                            <h4 class="header">
                                                {{ childField.name == '' ? 'No label' : childField.name }}
                                            </h4>
                                            <p>
                                                ID: {{ childField.id }}
                                            </p>
                                            <p>
                                                Type: {{ capitalize(childField.type.replaceAll('_', ' ').replaceAll('-',
                                                    ' ')) }} ({{ childField.type }})
                                            </p>
                                            <div v-show="expandedFields.includes(childField.id)">
                                                <div v-if="childField.visibilityCondition !== null">
                                                    <h4>Visibility Condition</h4>
                                                    <pre><a :href="`#${childField.visibilityCondition.leftFormFieldId}`" @click="highlightField(childField.visibilityCondition.leftFormFieldId)">{{ childField.visibilityCondition.leftFormFieldId }}</a> {{ childField.visibilityCondition.operator }} {{ childField.visibilityCondition.rightRestResponseId }}{{ childField.visibilityCondition.rightValue }}{{ childField.visibilityCondition.rightFormFieldId }}</pre>
                                                    <div v-if="childField.visibilityCondition.nextCondition">
                                                        <pre v-for="condition in unpackVisibilityConditions(childField.visibilityCondition.nextCondition)"
                                                            :key="condition?.leftFormFieldId">
                            <pre><a :href="`#${condition.leftFormFieldId}`">{{ condition.leftFormFieldId }}</a> {{ condition.operator }} {{ condition.rightValue }}{{ condition.rightFormFieldId }}</pre>
                                                    </pre>
                                                    </div>
                                                </div>
                                                <div v-if="childField.type === 'configurable_table_input'">
                                                    <h4>Configurable Input Table</h4>
                                                    <pre>{{ childField.params.customProperties.tableItemsConfiguration }}</pre>
                                                </div>
                                                <h4>All properties</h4>
                                                <pre wrap="true">
{{ childField }}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <h4>{{ field.name }}</h4>
                    <p>class: {{ field.className }}</p>
                    <div v-if="field.fieldType === 'ContainerRepresentation'">
                        <div v-for="childFieldCollection of field.fields" :key="childFieldCollection">
                            <div v-if="childFieldCollection.length > 0" class="card-stack">
                                <div v-for="childField of childFieldCollection" :key="childField" class="card">
                                    <img class="button-expand" src="~/assets/svg/arrowdown.svg" alt="Expand button"
                                        :data-field-id="`${childField.id}`" @click="expandField">
                                    <p class="header">
                                        {{ childField.name == '' ? 'No label' : childField.name }}
                                    </p>
                                    <p>
                                        ID: {{ childField.id }}
                                    </p>
                                    <p>
                                        Type: {{ capitalize(childField.type.replaceAll('_', ' ').replaceAll('-', ' ')) }}
                                        ({{ childField.type }})
                                    </p>
                                    <div v-show="expandedFields.includes(childField.id)">
                                        <div v-if="childField.visibilityCondition !== null">
                                            <h4>Visibility Condition</h4>
                                            <pre><a :href="`#${childField.visibilityCondition.leftFormFieldId}`" @click="highlightField(childField.visibilityCondition.leftFormFieldId)">{{ childField.visibilityCondition.leftFormFieldId }}</a> {{ childField.visibilityCondition.operator }} {{ childField.visibilityCondition.rightRestResponseId }}{{ childField.visibilityCondition.rightValue }}{{ childField.visibilityCondition.rightFormFieldId }}</pre>
                                            <div v-if="childField.visibilityCondition.nextCondition">
                                                <pre v-for="condition in unpackVisibilityConditions(childField.visibilityCondition.nextCondition)"
                                                    :key="condition?.leftFormFieldId">
                            <pre><a :href="`#${condition.leftFormFieldId}`">{{ condition.leftFormFieldId }}</a> {{ condition.operator }} {{ condition.rightValue }}{{ condition.rightFormFieldId }}</pre>
                                            </pre>
                                            </div>
                                        </div>
                                        <div v-if="childField.type === 'configurable_table_input'">
                                            <h4>Configurable Input Table</h4>
                                            <pre>{{ childField.params.customProperties.tableItemsConfiguration }}</pre>
                                        </div>
                                        <h4>All properties</h4>
                                        <pre>
{{ childField }}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>