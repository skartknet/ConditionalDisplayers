# Contributing Guidelines

The solution is divided in two projects. The plugin itself lives in the `/ConditionalDisplayers` folder.

This folder contains a Razor Class Library project that contains some C# code.

It also contains a `Client` folder that contains the Javascript for the package.

## Building the package
Before working on it, you need to build the JS code. To do so, you will need NodeJS and NPM. 

First, navigate to the `Client` folder and install all the dependencies running on your terminal:

``` 
npm install
```
Once all the dependencies have been installed, build the project by running:

```
npm run build
```

## Test site
There's included a TestWebV13 project that you can use to test Conditianl Displayers. 

You can reference the RCL above or use it to install any old version of the package.

The site is configured to do an unattended install. Check `appsettings.json` for the login details.

### uSync
The site includes some uSync files that you can use to recreate the Conditional Displayers data types and a document type that includes them all. They will also add a Test page on the root of the content tree using this DocType.
