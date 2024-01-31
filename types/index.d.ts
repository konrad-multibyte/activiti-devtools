
export interface VisiblityCondition {
    leftFormFieldId: string
    leftRestResponseId?: string
    operator: string
    rightValue: string
    rightType?: string
    rightFormFieldId?: string
    rightRestResponseId?: string
    nextConditionOperator?: string
    nextCondition?: VisiblityCondition
}

export interface Tab {
    id: string
    title: string
    visibilityCondition?: VisiblityCondition
}

export interface Outcome {
    id: string
    name: string
}

export interface Form {
    referenceId: string,
    name: string,
    description: string,
    editorJson: {
        tabs?: Tab[]
        fields: FormContainer[] | FormField[]
        outcomes: Outcome[]
        javascriptEvents: object[]
        className: string
        style: string
        metadata: object
        variables: object[]
        customFieldsValueInfo: object
        gridsterForm: boolean
    }
}

export interface FormContainer {
    fieldType: 'FormContainerRepresentation',
    id: string,
    name?: string,
    type: 'group',
    value?: string,
    required: boolean,
    readOnly: boolean,
    overrideId: boolean,
    colspan: number,
    placeholder?: string,
    minLength: number,
    maxLength: number,
    minValue?: string,
    maxValue?: string,
    regexPattern?: string,
    optionType?: string,
    hasEmptyValue?: string,
    options: object,
    restUrl?: string,
    restResponsePath?: null,
    restIdProperty?: null,
    restLabelProperty?: null,
    tab?: string,
    className?: string,
    dateDisplayFormat?: string,
    layout: {
        row: number,
        column: number,
        colspan: number
    },
    sizeX: number,
    sizeY: number,
    row: number,
    col: number,
    visibilityCondition?: VisiblityCondition,
    numberOfColumns: number,
    fields: {
        '1'?: FormField[],
        '2'?: FormField[],
        '3'?: FormField[],
        '5'?: FormField[],
        '6'?: FormField[],
        '7'?: FormField[],
        '8'?: FormField[],
        '9'?: FormField[],
    }
}

interface FormFieldOption {
    name: string
    id: string
}


interface FormField {
    fieldType: string,
    id: string,
    name?: string,
    type: string,
    value?: string,
    required: boolean,
    readOnly: boolean,
    overrideId: boolean,
    colspan: number,
    placeholder?: string,
    minLength: number,
    maxLength: number,
    minValue?: number,
    maxValue?: number,
    regexPattern?: string,
    optionType?: string,
    hasEmptyValue?: string,
    options?: FormFieldOption[] | null,
    restUrl?: string,
    restResponsePath?: string,
    restIdProperty?: string,
    restLabelProperty?: string,
    tab?: string,
    className?: string,
    params: {
        existingColspan?: number,
        maxColspan: number,
        customProperties: object
    },
    dateDisplayFormat?: string,
    layout: {
        row: number,
        column: number,
        colspan: number
    },
    sizeX: number,
    sizeY: number,
    row: number,
    col: number,
    visibilityCondition: VisiblityCondition
}

export interface FormMeta {
    id: string,
    name: string,
    description: string
}

interface ConfigurableInputTableVisibilityCondition {
    condition: string;
    nextConditionOperator?: string;
    controlId?: string;
    tableControlId?: string;
    processVariable?: string;
    value?: string;
    key?: string;
    operand?: string | boolean;
}


export const isContainer = (field: any): field is FormContainer => {
    Object.keys(field).includes('fields')
}

export const isField = (field: any): field is FormField => {
    !Object.keys(field).includes('fields')
}

interface Confluence {
    containers: ConfluenceContainer[]
}

interface ConfluenceContainer {
    title: string
    header: [
        'Label Id',
        'Label',
        'Placeholder',
        'PDF Label',
        'Form component',
        'Options',
        'Displayed',
        'Required or optional?',
        'Prepopulated?',
        'Prepopulated from?',
        'Editable (if pre-populated)',
        'Notes'
    ]
    fields: ConfluenceField[]
}

interface ConfluenceField {
    labelId: string
    label: string
    placeholder: string
    pdfLabel: string
    formComponent: string
    options: string
    displayed: string
    required: boolean
    prepopulated: string
    prepopulatedFrom: string
    prepopulatedEditable: string
    notes: string
}