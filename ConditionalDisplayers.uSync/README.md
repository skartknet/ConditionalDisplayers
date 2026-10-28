# Conditional Displayers uSync

Adds uSync support for [Conditional Displayers](https://www.nuget.org/packages/Our.Umbraco.ConditionalDisplayers). It exports and imports your visibility rules, so they travel with the rest of your uSync files.

## Requirements

This package is an add-on, not a standalone package. It needs:

- **Our.Umbraco.ConditionalDisplayers** 18, which provides the rules this package syncs. Without it, there is nothing to sync.
- **uSync** 18.
- **Umbraco** 18.

## Installation

```sh
dotnet add package Our.Umbraco.ConditionalDisplayers
dotnet add package Our.Umbraco.ConditionalDisplayers.uSync
```

## How it works

Rules are exported as one file per document, media or member type. They show up in the uSync dashboard under 'Conditional Displayers'. Rules are saved to disk whenever you change them, and applied when you import.

## Links

- [Source and documentation](https://github.com/skartknet/ConditionalDisplayers)
