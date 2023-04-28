# Configuration

## Editors
### Checkbox

Create a new DataType and select '[Conditional] Checkbox Displayer' as the Property Editor.

-*Default* value: select the value that the checkbox will have by default: checked/unchecked.

-*Show when checked*: enter the aliases of those properties you want to show when the checkbox is checked. Note: these properties <b>will be hidden</b> if it's unchecked.

-*Show when unchecked*: enter the aliases of those properties you want to show when the checkbox is unchecked. Note: these properties <b>will be hidden</b> if it's checked.

### Dropdown

Create a new DataType and select '[Conditional] Dropdown Displayer' as the Property Editor.

You'll have to create a list of options that the dropdown will display. In addition to the value you have two other inputs used to show or hide one or more properties.

-*Show when selected*: enter the aliases of those properties you want to show when the checkbox is selected. Note: these properties <b>won't be hidden</b> when this value unselected.

-*Hide when selected*: enter the aliases of those properties you want to show when the checkbox is selected. Note: these properties <b>won't be hidden</b> when this value unselected.

><strong>Note:</strong> the difference of behaviour between the checkbox and the dropdown input logic can be a bit confusing, but after a lot of testing it seems the most flexible way to combine the different possibilities when configuring them. I'm open to other behaviour suggestions.

### Radio list

There's also a radio list datatype with the name '[Conditional] Radio List Displayer'. The configuration of this editor is the same as the previous ones

## Tabs and Groups
The previous documentation talks about *property names* to configure the editors, but you can also configure them to show or hide tabs and groups. [Jump to the extended documentation.](tabs-and-groups)


## Getting the values on the templates

The Conditional Displayers are normal property editors so you can access their values as with any other property (strongly typed model, Model.Value(),...)

# Contributing

Conditional Displayers is open to anyone that want to contribute!

If you have any ideas, feedback or issues please let me know. With everyones effort we can make an awesome package.

[Issues](https://github.com/skartknet/ConditionalDisplayers/issues)

[Discussions](https://github.com/skartknet/ConditionalDisplayers/discussions)

If you want to contribute to the code that's awesome!

To start working on new code, you should start by forking the repository, cloning it to your computer, and creating a new branch from the `master` branch.

Once you are done making your changes, push them to your branch, and create a Pull Request (aka PR) back to the `master` branch of this repo. We'll take a look and if everything works fine, your changes will be release in the next version.

## Working locally

The solution in this repo includes a ConditionalDisplayers project, which is the actual package, and a few UmbracoVx that are used for testing.

You can access to the backoffice of all the site with the following credentials:

**Username**: `admin@admin.com`\
**Password**: `Password123`