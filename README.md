# express-route-loader

## Motivation

This library is originally designed to be used in our university projects, so it is made to be extremely simple to use. Very often manually requiring and assigning Routers via `app.use('/', routerModule)` proved to be confusing and time consuming if we wanted to organise our files properly, so this is meant to alleviate most - if not all - of those issues. With this library it is possible to build directory structures that directly map to URLs, so scripts are contained where they belong, and oragnised in an easy-to-find and logical way.

Additionally it is meant to open up the process a litte and make it possible to write additional tools to speed up project pipelines. As an example, it would be possible to automatically generate a javascript file developers on the frontend team can use to interface with the API.

## Installation
```
npm install express-route-loader
```

## Requirements

The library assumes that `Express 4.X` is used and the route modules are defined using `express.Router();`.

## Usage

Require the script in the main loader file (for us it's usually the app.js), and after the Express App's configuration is done, call `load()`:
```js
//Load and configure Express
var express = require('express');
var app = express();
//Load and configure the loader
var routeLoader = require('express-route-loader');
routeLoader.load(app);
```

For the following `routes/` directory layout the module will generate and attach the following URL:

```
projectRoot/routes
├ accounts
|   ├ corporate
|       ├ corp.js               : <domain>/accounts/corporate/<module routes>
|   ├ accountsHandler.js        : <domain>/accounts/<module routes>
├ orders
|   ├ orderHandler.js           : <domain>/orders/<module routes>
├ index.js                      : <domain>/<module routes>
```

## Optional arguments

### Options
As the second argument of `load`, an object can be passed with the following keys to change the module's settings:

|  |  |
| --- | --- |
| [`routesFolder`](#routesFolder) | Path to the routes/ folder |
| [`exclusions`](#exclusions) | Names and / or Regular Expressions of files and folders to be ignored |
| [`prefix`](#prefix) | Prefix prepended to route URLs |
| [`logger`](#logger) | A logger instance used by the module to log events |

#### Example:
```js
let options = {
    routesFolder: "./routes",
    exclusions: ["database"]
}
routeLoader.loadModules(app, options);
```

#### routesFolder
A string containing a valid relative path within the project's folder.

Deafult: `path.join(process.cwd(), "routes")` => `projectRoot/routes`

#### exclusions

An array containing excluded filenames (full file or folder name match without extension) and / or Regular Expressions.

Files starting with `.` or `_` are always and automatically excluded. The `node_modules` directories are always excluded.

Deafult: `node_modules`

#### prefix
A string that is prepended to every route URL.

Deafult: none

#### logger
A logger instance used for logging. If left out it defaults to the basic `console` functions: `console.log/warn/error();`. Two parameters are passed, the message, and an optional object that contains related data (for example the settings the module is using).

It has been written with `winston` in mind, so attaching a `winston` instance should work without issue.

Deafult: Node Console

### Callback

As a third parameter, a callback function can be provided, which is called after every file that has been succesfully loaded. 

This is intended for building additional tools on top of the functionality this library provides.

The callback's only argument is an object which will have the following properties:

|  |  |
| --- | --- |
| `instance` | The Router module itself, as if it was imported |
| `path` | The absolute filesystem path pointing to the `instance`'s location |
| `mountURL` | The full URL in the `app` to which the `instance` is mounted |
| `routes` | An array containing the routes defined in `instance` as this library processed them |

#### Example:
```js
routeLoader.load(app, options, (routerModule)=>{
    console.log(routerModule.instance); // <Router module>
    console.log(routerModule.path);     // 'd:\\backend\\routes\\index.js'
    console.log(routerModule.mountURL); // '/'
    console.log(routerModule.routes);   // [{id: 'd15aacfd-62b6-594e-93cf-85baa5e441ec', name: 'get_root', route: '/', parameters: [], method: 'get', modulePath: 'd:\\backend\\routes\\index.js', mountURL: '/'}, ...]
});
```

## Extras

### loadedRoutes

Contains the list of routes that were loaded in. This can be used to build further tools that process the routes further, for example creating an export that can be used for automatically generating a documentation template.

Every element of an array follows the same structure:
```js
[
    {
        id: 'd15aacfd-62b6-594e-93cf-85baa5e441ec',
        name: 'get_root',
        route: '/',
        parameters: [], //every element is a string containing the parameter name as defined in the router module (leading : exlcuded)
        method: 'get',
        modulePath: 'd:\\backend\\routes\\index.js',
        mountURL: '/'
    }, 
    ...
]
```

### loadedModules

Contains the list of Router modules that were loaded in. This is mainly for debugging and diagnostic purposes, as it can often be helpful to see which modules have actually been loaded in, and where are they attached.

```js
[
    {
        modulePath: 'd:\\backend\\routes\\index.js',
        mountURL: '/'
    }, 
    ...
]
```