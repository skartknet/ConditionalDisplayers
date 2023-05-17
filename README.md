# Conditional Displayers

This is an Umbraco package. It implements a checkbox, a dropdown and a radio list datatype editors that work like the core ones (in fact they are based in the same code), but allows to hide or display other properties in the same Document Type.

## Installation

### Nuget
[![NuGet](https://buildstats.info/nuget/Our.Umbraco.ConditionalDisplayers)](https://www.nuget.org/packages/Our.Umbraco.ConditionalDisplayers/)

Run this form your Package Manager Console in Visual Studio:

    PM> Install-Package Our.Umbraco.ConditionalDisplayers


## Upgrading
### Version 3.3.0
This version uses the new UUI Library included by default in Umbraco 10.4 + and 11.1 + based on this post: https://umbraco.com/blog/umbraco-product-update-january-2023/

For previous versions of Umbraco that still support the uui, you will need to include or reference the library's css and js files manually.

## Icon
<a target="_blank" href="https://icons8.com/icon/63snXzoESd3s/fire-hydrant">Fire Hydrant</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>

## Changelog
### 3.5.0
- Fix bug when dropdown is used in a block list property

