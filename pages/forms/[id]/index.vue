<script setup lang="ts">
import { doc, onSnapshot, deleteDoc } from "firebase/firestore"
import type { Form, FormField, VisiblityCondition } from "~/types/index.d.js"

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
const isMounted = ref(false)
const route = useRoute()
const id = route.params.id as string
const expandedFields = ref<string[]>([])
const selectedTab = ref<string>('tab1')
const tabs = ref([])
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
const isFormControlOpen = ref(false)
const slideoverField = ref<FormField>({
    fieldType: "",
    id: "",
    type: "",
    required: false,
    readOnly: false,
    overrideId: false,
    colspan: 0,
    minLength: 0,
    maxLength: 0,
    params: {
        existingColspan: 0,
        maxColspan: 0,
        customProperties: undefined
    },
    layout: {
        row: 0,
        column: 0,
        colspan: 0
    },
    sizeX: 0,
    sizeY: 0,
    row: 0,
    col: 0,
    visibilityCondition: null
})

const links = [
    {
        label: "Confluence",
        to: `/forms/${id}/document`
    }
]
const isFormControlAllPropsOpen = ref(false)

onMounted(async () => {
    const { firestore } = useFirebase()
    const docRef = doc(firestore, 'forms', id)
    onSnapshot(docRef, (snap) => {
        const data = snap.data()
        if (data != undefined) {
            form.value = data as Form
            useHead({
                title: `${form.value.name} - Activiti Devtools`
            })
        }
        if (form.value.editorJson?.tabs) {
            for (const tab of form.value.editorJson.tabs) {
                tabs.value.push({ key: tab.id, label: tab.title })
            }
        }
    })
    isMounted.value = true
})

const removeForm = async () => {
    const { firestore } = useFirebase()
    const router = useRouter()
    await deleteDoc(doc(firestore, 'forms', id))
    await deleteDoc(doc(firestore, 'forms-meta', id))
    router.push('/forms')
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

const openFormControlSlideover = async (field: FormField) => {
    slideoverField.value = field
    isFormControlOpen.value = true
}

const openFormControlAllPropsSlideover = async (field: FormField) => {
    slideoverField.value = field
    isFormControlAllPropsOpen.value = true
}

function unpackVisibilityConditions(nestedVisibilityCondition: VisiblityCondition | null | undefined) {
    const conditions = []
    while (nestedVisibilityCondition !== null) {
        conditions.push(nestedVisibilityCondition)
        nestedVisibilityCondition = nestedVisibilityCondition?.nextCondition
    }
    return conditions
}

</script>

<template>
        <div class="header">
            <h1 v-if="isMounted" class="text-2xl">{{ form.name }}</h1>
            <USkeleton v-else class="h-[30px] w-[500px]" />
            <div v-if="form.description" class="text-md">
                {{ form.description }}
            </div>
            <div v-if="isMounted" class="text-md italic">
                No description provided.
            </div>
            <USkeleton v-else class="h-[24px] w-[350px]" />
        </div>
        <UHorizontalNavigation :links="links" />
        <UCard>
            <template #header>
                <h1>Form controls</h1>
            </template>
            <UButton color="red" @click="removeForm">
                    Delete
            </UButton>
            </UCard>
            <USlideover v-model="isFormControlOpen">
                <UCard>
                    <template #header>
                        <h1 class="text-xl">
                            {{ slideoverField.name }}
                        </h1>
                        <p>
                            {{ slideoverField.id }}
                        </p>
                    </template>
                    <div class="p-4 flex-1">
                        <div v-if="slideoverField.type === 'configurable_table_input'">
                            <h4>Configurable Input Table</h4>
                            <pre>{{ slideoverField.params.customProperties.tableItemsConfiguration }}</pre>
                        </div>
                    </div>
                </UCard>
            </USlideover>
            <USlideover v-model="isFormControlAllPropsOpen">
                <UCard>
                    <template #header>
                        <h1 class="text-xl">
                            {{ slideoverField.name }}
                        </h1>
                        <p>
                            {{  slideoverField.id }}
                        </p>
                    </template>
                    <pre wrap="true">
    {{ slideoverField }}
                    </pre>
                </UCard>
            </USlideover>
            <!-- <div v-if="form.editorJson?.tabs" class="tabs">
                <div v-for="(tab, index) in form.editorJson.tabs" :class="`tab ${index === 0 ? 'active' : ''}`"
                    :data-tab-id="tab.id" @click="selectTab">
                    {{ tab.title }}
                </div>
            </div> -->
            <template v-if="isMounted">
                <div v-if="form.editorJson.tabs?.length > 0">
                    <UTabs :items="tabs">
                        <template #item="{ item }">
                                <div v-for="field of form.editorJson.fields" :key="field.id">
                                    <div v-if="field.tab">
                                        <div v-if="field.tab === item.key">
                                            <UCard class="mt-3">
                                                <template v-if="field.type != 'container'" #header>
                                                    <h2 class="text-2xl">{{ field.name }}</h2>
                                                    <p v-if="!!field.className">class: {{ field.className }}</p>
                                                </template>
                                                <div v-if="field.fieldType === 'ContainerRepresentation'">
                                                    <div v-for="childFieldCollection of field.fields" :key="childFieldCollection.id">
                                                        <div v-if="childFieldCollection.length > 0">
                                                            <div class="card-stack">
                                                                <UCard v-for="childField of childFieldCollection" :id="childField.id"
                                                                    :key="childField.id" class="mt-3">
                                                                    <template #header>
                                                                        <h4 class="text-xl">
                                                                            {{ childField.name == '' ? 'No label' : childField.name }}
                                                                        </h4>
                                                                        <p>
                                                                            {{ capitalize(childField.type.replaceAll('_', ' ').replaceAll('- ', ' ')) }} ({{ childField.type }})
                                                                        </p>
                                                                        <!-- TODO: Implement flagging  -->
                                                                        <!-- <UTooltip text="Flag this control">
                                                                            <UIcon name="i-heroicons-flag" @click=""/>
                                                                        </UTooltip> -->
                                                                    </template>
                                                                    <p>
                                                                        ID: {{ childField.id }}
                                                                    </p>
                                                                    <div v-show="expandedFields.includes(childField.id)">
                                                                        <div v-if="childField.visibilityCondition !== null">
                                                                            <h4>Visibility Condition</h4>
                                                                            <pre><a :href="`#${childField.visibilityCondition.leftFormFieldId}`" @click="highlightField(childField.visibilityCondition.leftFormFieldId)">{{ childField.visibilityCondition.leftFormFieldId }}</a> {{ childField.visibilityCondition.operator }} {{ childField.visibilityCondition.rightRestResponseId }}{{ childField.visibilityCondition.rightValue }}{{ childField.visibilityCondition.rightFormFieldId }}</pre>
                                                                            <div v-if="childField.visibilityCondition.nextCondition">
                                                                                <pre v-for="condition in unpackVisibilityConditions(childField.visibilityCondition.nextCondition)"
                                                                                    :key="condition?.leftFormFieldId"><a :href="`#${condition.leftFormFieldId}`">{{ condition.leftFormFieldId }}</a> {{ condition.operator }} {{ condition.rightValue }}{{ condition.rightFormFieldId }}</pre>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <template #footer>
                                                                        <UButton label="Open" @click="openFormControlSlideover(childField)" />
                                                                        <UButton label="All properties" @click="openFormControlAllPropsSlideover(childField)" />
                                                                    </template>
                                                                </UCard>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </UCard>
                                        </div>
                                    </div>
                                </div>
                            </template>
                    </UTabs>
                </div>
                <div v-else>
                    <div v-for="field of form.editorJson.fields" :key="field.id">
                                        <UCard class="mt-3">
                                            <template v-if="field.type != 'container'" #header>
                                                <h2 class="text-2xl">{{ field.name }}</h2>
                                                <p v-if="!!field.className">class: {{ field.className }}</p>
                                            </template>
                                            <div v-if="field.fieldType === 'ContainerRepresentation'">
                                                <div v-for="childFieldCollection of field.fields" :key="childFieldCollection.id">
                                                    <div v-if="childFieldCollection.length > 0">
                                                        <div class="card-stack">
                                                            <UCard v-for="childField of childFieldCollection" :id="childField.id"
                                                                :key="childField.id" class="mt-3">
                                                                <template #header>
                                                                    <h4 class="text-xl">
                                                                        {{ childField.name == '' ? 'No label' : childField.name }}
                                                                    </h4>
                                                                    <p>
                                                                        {{ capitalize(childField.type.replaceAll('_', ' ').replaceAll('- ', ' ')) }} ({{ childField.type }})
                                                                    </p>
                                                                    <!-- TODO: Implement flagging  -->
                                                                    <!-- <UTooltip text="Flag this control">
                                                                        <UIcon name="i-heroicons-flag" @click=""/>
                                                                    </UTooltip> -->
                                                                </template>
                                                                <p>
                                                                    ID: {{ childField.id }}
                                                                </p>
                                                                <div v-show="expandedFields.includes(childField.id)">
                                                                    <div v-if="childField.visibilityCondition !== null">
                                                                        <h4>Visibility Condition</h4>
                                                                        <pre><a :href="`#${childField.visibilityCondition.leftFormFieldId}`" @click="highlightField(childField.visibilityCondition.leftFormFieldId)">{{ childField.visibilityCondition.leftFormFieldId }}</a> {{ childField.visibilityCondition.operator }} {{ childField.visibilityCondition.rightRestResponseId }}{{ childField.visibilityCondition.rightValue }}{{ childField.visibilityCondition.rightFormFieldId }}</pre>
                                                                        <div v-if="childField.visibilityCondition.nextCondition">
                                                                            <pre v-for="condition in unpackVisibilityConditions(childField.visibilityCondition.nextCondition)"
                                                                                :key="condition?.leftFormFieldId"><a :href="`#${condition.leftFormFieldId}`">{{ condition.leftFormFieldId }}</a> {{ condition.operator }} {{ condition.rightValue }}{{ condition.rightFormFieldId }}</pre>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <template #footer>
                                                                    <div class="space-x-4">
                                                                        <UButton label="Open" @click="openFormControlSlideover(childField)" />
                                                                        <UButton label="All properties" @click="openFormControlAllPropsSlideover(childField)" />
                                                                    </div>
                                                                </template>
                                                            </UCard>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </UCard>
                                <div v-if="field.tab">
                                    <div v-if="field.tab === item.key">
                                    </div>
                                </div>
                            </div>
                </div>
            </template>
            <USkeleton v-else class="w-full md:w-auto" />
            <!-- <div class="form-preview-representation">
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
                                                                :key="condition?.leftFormFieldId"><a :href="`#${condition.leftFormFieldId}`">{{ condition.leftFormFieldId }}</a> {{ condition.operator }} {{ condition.rightValue }}{{ condition.rightFormFieldId }}</pre>
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
            </div> -->
</template>