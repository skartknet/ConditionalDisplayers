# Conditional Displayers Deploy

Adds Umbraco Deploy support for [Conditional Displayers](https://www.nuget.org/packages/Our.Umbraco.ConditionalDisplayers). It transfers your visibility rules between environments along with the content types they belong to.

## Requirements

This package is an add-on, not a standalone package. It needs:

- **Our.Umbraco.ConditionalDisplayers** 17 or later, which provides the rules this package transfers. Without it, there is nothing to deploy.
- **Umbraco Deploy** 17 or later (a licensed product).
- Umbraco 17.

## Installation

```sh
dotnet add package Our.Umbraco.ConditionalDisplayers
dotnet add package Our.Umbraco.ConditionalDisplayers.Deploy
```

Install both on every environment you deploy between.

## Links

- [Source and documentation](https://github.com/skartknet/ConditionalDisplayers)
