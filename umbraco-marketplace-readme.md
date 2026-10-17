# Conditional Displayers

Umbraco package that shows or hides properties in the backoffice based on the values of other properties on the same content type.

Open any property in a document, media, member or element type and use its new **Visibility** tab to add rules, such as 'show this property when Offer type is any of Discount' or 'hide it when Title is empty'. Rules support AND and OR, work with blocks and variants, and groups and tabs hide themselves when everything in them is hidden.

[Read the guide](https://github.com/skartknet/ConditionalDisplayers/blob/master/Documentation/README.md)

## Installation

### NuGet
![NuGet Downloads](https://img.shields.io/nuget/dt/Our.Umbraco.ConditionalDisplayers?label=Our.Umbraco.ConditionalDisplayers)

https://www.nuget.org/packages/Our.Umbraco.ConditionalDisplayers

Run this from your Package Manager Console in Visual Studio:

    PM> Install-Package Our.Umbraco.ConditionalDisplayers

### Versions

| Package version | Umbraco | What it offers |
|---|---|---|
| 17 | 16 and 17 | Visibility rules on any property |
| 16 | 16 and 17 | Checkbox, radio and dropdown editors that show or hide other properties ([documentation](https://github.com/skartknet/ConditionalDisplayers/blob/master/Documentation/Previous%20versions/README.md)) |
| 3 | Less than 16 | The same editors, for older backoffices |

### Upgrading from version 16 or earlier

Version 17 includes a one-way migration that turns the settings of your existing Conditional Displayers data types into visibility rules. If you use uSync, export it after the first start, or the next import will write the old settings back. The guide explains what changes.

## Icon
<a target="_blank" href="https://icons8.com/icon/63snXzoESd3s/fire-hydrant">Fire Hydrant</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
