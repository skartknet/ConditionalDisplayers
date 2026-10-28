# Conditional Displayers

Umbraco package that shows or hides properties in the backoffice based on the values of other properties on the same content type.

Open any property in a document, media, member or element type and use its new **Visibility** tab to add rules, such as 'show this property when Offer type is any of Discount' or 'hide it when Title is empty'. Rules support AND and OR, work with blocks and variants, and groups and tabs hide themselves when everything in them is hidden.

[Read the guide](./Documentation/README.md)

## Installation

### NuGet
![NuGet Downloads](https://img.shields.io/nuget/dt/Our.Umbraco.ConditionalDisplayers?label=Our.Umbraco.ConditionalDisplayers)

https://www.nuget.org/packages/Our.Umbraco.ConditionalDisplayers

Run this from your Package Manager Console in Visual Studio:

    PM> Install-Package Our.Umbraco.ConditionalDisplayers

### Versions

| Package version | Umbraco | What it offers |
|---|---|---|
| 18 | 18 and its minor versions | Visibility rules on any property |
| 17 | 17 | Visibility rules on any property |
| 16 | 16 and 17 | Checkbox, radio and dropdown editors that show or hide other properties |
| 3 | Less than 16 | The same editors, for older backoffices |

### Upgrading from version 16 or earlier

Version 17 includes a one-way migration that turns the settings of your existing Conditional Displayers data types into visibility rules. If you use uSync, export it after the first start, or the next import will write the old settings back. The guide explains what changes.


## Contributing

Conditional Displayers is open to anyone who wants to contribute. If you have ideas, feedback or issues, let us know.

- [Issues](https://github.com/skartknet/ConditionalDisplayers/issues)
- [Discussions](https://github.com/skartknet/ConditionalDisplayers/discussions)

To contribute code, fork the repository, clone it and create a branch from `master`. When you're done, push the branch and open a pull request back to `master`.

### Working locally

The solution contains the `ConditionalDisplayers` project (the package itself), the `ConditionalDisplayers.Tests` unit tests and a `TestWebV18` site for manual testing.

```sh
# Client (build before the .NET build)
cd ConditionalDisplayers/Client
npm ci
npm run build

# Test site
dotnet run --project TestWebV18

# Unit tests, then browser tests against the running test site
dotnet test ConditionalDisplayers.Tests
npm run e2e
```

Sign in to the test site's backoffice with:

**Username**: `admin@admin.com`\
**Password**: `Password123`

## Icon
[Eye icon](https://icons8.com/icon/74NRJjZyt5EM/eye) by [Icons8](https://icons8.com)

## AI Disclaimer
Yes, this package has been done with the help of Claude. A human has been reviewing the code and drinking coffee on its behalf.

# Special Ackowledgement
The intelectual author of the new approach to the properties visibility (since v17), instead or relying in additional property editors, is [Richard Ockerby](https://www.linkedin.com/in/richard-ockerby/).

He was planning to release a new package with this approach but I suggested that improving Conditional Displayers would keep the package alive and would keep its user base.

I stole his idea with his permission and developed this new version of Conditional Displayers.

Thanks Richard, H5YR!

-- Mario