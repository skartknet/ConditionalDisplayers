import { PropertyEditorSettingsProperty } from "@umbraco-cms/backoffice/property-editor";
import { elementName as cdCheckboxElementName } from './checkbox'
import { elementName as cdRadioElementName } from './radio'
import { elementName as cdDropdownFlexibleElementName } from './dropdown'

export const cdCheckboxPropertyInfo = {
    default: {
        label: "Initial state",
        description: "The initial state for the checkbox for new items and before the editor changes it.",
        alias: "default",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.Toggle"
    },
    showIfChecked: {
        label: "Show if checked",
        description: "Aliases of the properties to show when the checkbox is checked.<br />*Multiple aliases must be comma separated.*",
        alias: "showIfChecked",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
    },
    showIfUnchecked: {
        label: "Show if unchecked",
        description: "Aliases of the properties to show when the checkbox is unchecked.<br />*Multiple aliases must be comma separated.*",
        alias: "showIfUnchecked",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
    },
    showLabels: {
        label: "Show toggle labels",
        description: "Show labels next to toggle button.",
        alias: "showLabels",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.Toggle"
    },
    labelOn: {
        label: "Label On",
        description: "Label text when enabled.",
        alias: "labelOn",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
    },
    labelOff: {
        label: "Label Off",
        description: "Label text when disabled.",
        alias: "labelOff",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
    }
} satisfies Record<string, PropertyEditorSettingsProperty & { value?: any }>;

export const cdRadioPropertyInfo = {
    items: {
        label: "Add prevalue",
        description: "Add, remove or sort values for the conditional list.<br />*Multiple aliases must be comma separated.*",
        alias: "items",
        propertyEditorUiAlias: "Our.Umbraco.CdMultivalues",
    },
    default: {
        label: "Default value",
        description: "Type the value name from the list created above to be the initial default selection.<br/>*(Optional)*",
        alias: "default",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
    },
    alignHrz: {
        label: "Align Horizontally",
        description: "Radio button are stacked vertically by default. Toggle this to align them horizontally",
        alias: "alignHrz",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.Toggle"
    },
    labelsPos: {
        label: "Labels Position",
        description: "Works with horizontally aligned list only and not with standard buttons. Default is 'Right'",
        alias: "labelsPos",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.RadioButtonList",
        config: [
            {
                alias: "items",
                value: ["Top", "Bottom", "Left", "Right"],
            }
        ]
    },
    asBtn: {
        label: "As Standard Buttons",
        description: "To display as standard buttons instead of radio buttons. Horizontally aligned by default.",
        alias: "asBtn",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.Toggle"
    }
} satisfies Record<string, PropertyEditorSettingsProperty & { value?: any }>;

export const cdDropdownFlexiblePropertyInfo = {
    items: {
        label: "Add prevalue",
        description: "Add, remove or sort values for the conditional list.<br />*Multiple aliases must be comma separated.*",
        alias: "items",
        propertyEditorUiAlias: "Our.Umbraco.CdMultivalues",
    },
    default: {
        label: "Default value",
        description: "Type the value name from the list created above to be the initial default selection.<br/>*(Optional)*",
        alias: "default",
        propertyEditorUiAlias: "Umb.PropertyEditorUi.TextBox"
    }
} satisfies Record<string, PropertyEditorSettingsProperty & { value?: any }>;

const cdCheckboxProperties: Array<PropertyEditorSettingsProperty & { value?: any }> = Object.keys(cdCheckboxPropertyInfo).map(x => (cdCheckboxPropertyInfo as unknown as Record<string, PropertyEditorSettingsProperty & { value?: any }>)[x]);
const cdRadioProperties: Array<PropertyEditorSettingsProperty & { value?: any }> = Object.keys(cdRadioPropertyInfo).map(x => (cdRadioPropertyInfo as unknown as Record<string, PropertyEditorSettingsProperty & { value?: any }>)[x]);
const cdDropdownFlexibleProperties: Array<PropertyEditorSettingsProperty & { value?: any }> = Object.keys(cdDropdownFlexiblePropertyInfo).map(x => (cdDropdownFlexiblePropertyInfo as unknown as Record<string, PropertyEditorSettingsProperty & { value?: any }>)[x]);

export const manifests: Array<UmbExtensionManifest> = [
    // custom view for prevalues (will not be displayed in backoffice)
    {
        type: "propertyEditorUi",
        alias: "Our.Umbraco.CdMultivalues",
        name: "[Conditional] Multivalues Displayer",
        element: () => import("../components/cdMultivalues"),
        meta: {
            label: "[Conditional] Multivalues Displayer",
            icon: "icon-autofill",
            group: "common",
        },
    },
    // Conditional Checkbox
    {
        type: "propertyEditorUi",
        alias: "Our.Umbraco.CdCheckbox",
        name: "[Conditional] Checkbox Displayer",
        element: () => import("./checkbox"),
        elementName: cdCheckboxElementName,
        meta: {
            label: "[Conditional] Checkbox Displayer",
            icon: "icon-checkbox-dotted-active",
            group: "Conditional Displayers",
            propertyEditorSchemaAlias: "Umbraco.Plain.String",
            settings: {
                properties: cdCheckboxProperties
            }
        },
    },
    // Conditional Radio
    {
        type: "propertyEditorUi",
        alias: "Our.Umbraco.CdRadio",
        name: "[Conditional] Radio Displayer",
        element: () => import("./radio"),
        elementName: cdRadioElementName,
        meta: {
            label: "[Conditional] Radio Displayer",
            icon: "icon-circle-dotted-active",
            group: "Conditional Displayers",
            propertyEditorSchemaAlias: "Umbraco.Plain.String",
            settings: {
                properties: cdRadioProperties,
                defaultData: [
                    {
                        alias: cdRadioPropertyInfo.labelsPos.alias,
                        value: 'Right'
                    }
                ]
            }
        },
    },
    // Conditional Dropdown
    {
        type: "propertyEditorUi",
        alias: "Our.Umbraco.CdDropdownFlexible",
        name: "[Conditional] Dropdown Displayer",
        element: () => import("./dropdown"),
        elementName: cdDropdownFlexibleElementName,
        meta: {
            label: "[Conditional] Dropdown Displayer",
            icon: "icon-filter-arrows",
            group: "Conditional Displayers",
            propertyEditorSchemaAlias: "Umbraco.Plain.String",
            settings: {
                properties: cdDropdownFlexibleProperties
            }
        },
    }
];
