const url = require("./url");
const uuidv5 = require('uuid').v5;

const loadedRoutes = [];
const loadedModules = [];

/**
 * Checks whether or not the given Node module is an Express 4.X Router module.
 * @param {Array.<string>} jsModule The module object to be verified
 * @returns {Boolean} Returns `true` if the module is a compatible Express Router module, `false` if not.
 */
 function isCompatibleExpress4xRouterModule(jsModule, logger) {
    let isValid = false;
    /* 
    * When importing an Express 4.X Router module:
    * ExpressRouterModule.stack     - List of all subroutes defined in the file as an array
    * ↓
    * stack[elementID] => element   - Contains a subroute's information
    * ↓
    * element.route                 - Contains the subroute's basic data
    * ↓
    * route.method                  - The route's method, object: {get: true}. False keys do not appear.
    * route.path                    - Full string value of the route, as defined in the file, including parameters
    */
    const moduleCheck = jsModule.instance;
    if (moduleCheck.stack != undefined && Array.isArray(moduleCheck.stack) == true && moduleCheck.stack.length != 0)
    {
        isValid = moduleCheck.stack.every(element => element.route != undefined && element.route.path != undefined && element.route.methods != undefined)
    }
    if (isValid == false)
    {
        logger.warn(`Module at ${jsModule.path} is not compatible, and have been skipped. One or more compatibility checks have failed: stack ${Array.isArray(jsModule.instance.stack)?"elements' structure is incompatible":"is not an array"}`, jsModule.instance.stack);
    }
    return isValid;
}

/**
 * Processes the router module and mounts it to the Express App instance.
 * @param {ExpressApp} app The express app instance running the application
 * @param {Object} settings Options for the module
 * @param {string} routerModuleAbsolutePath The Router module's absolute path
 * @param {function()} callback Callback fired for every valid file loaded. Returns the module's assigned URL and absolute file system path.
 */
function handleRouterFile(app, settings, routerModuleAbsolutePath="", callback) {
    const routerModule = {
        instance: require(routerModuleAbsolutePath),
        path: routerModuleAbsolutePath,
        mountURL: "",
        routes: []
    }
    if (isCompatibleExpress4xRouterModule(routerModule, settings.logger)) // Module is valid
    {
        // Grab the module's path to use it as an URL
        routerModule.mountURL = url.pathToURL(settings.modulesRootFolderPath, routerModule.path);
        // ----------------------
        // Attach the module to the Express App
        app.use(routerModule.mountURL, routerModule.instance);
        // ----------------------
        // Parse the routes defined in the router module and add them to the script's registry
        const moduleRoutes = routerModule.instance.stack;
        // ----------------------
        moduleRoutes.forEach(element => {
            // Variable to hold the route path; Initialize it with the module's attach path
            const route = url.buildURL(settings.prefix, routerModule.mountURL, element.route.path);
            // Parse parameters out of the route and list them in order of occurrence
            const parameters = url.getURLParameters(route);
            // Generate a new, unique name for the route
            const method = Object.keys(element.route.methods)[0];
            // Generate the UUID of the full route
            const id = uuidv5(route, uuidv5.URL);
            // Generate a new, unique name for the route
            // Starts with the method name _ URL(parameters removed, separator is _)_ by_ last parameter
            const name = `${ method }${ getRouteName(route) }${ parameters[parameters.length-1] ? "by_" + parameters[parameters.length-1] : "" }`;
            // Add the route as a new entry to the register
            const routeIndex = routerModule.routes.findIndex(element => element.id == id);
            if (routeIndex != -1)
            {
                routerModule.routes[id].methods.push(method);
            }
            else
            {
                routerModule.routes[id] = {
                    id,
                    name,
                    route,
                    parameters,
                    modulePath: routerModule.path,
                    mountURL: routerModule.mountURL,
                    methods: []
                }
                routerModule.routes[id].methods.push(method);
            }
            loadedRoutes.push(routerModule.routes[id]);
        });
        // ----------------------
        loadedModules.push({
            modulePath: routerModule.path,
            mountURL: routerModule.mountURL
        });
        // ----------------------
        // returns the route file information
        callback(routerModule);
        // ----------------------
        settings.logger.info(`Router at ${routerModule.path}\n Has been mounted at ${routerModule.mountURL}`, routerModule.routes);
    }
}

/**
 * Generates a name for the route from its URL.
 * @param {string} url A route URL as expressed in the router module
 * @returns {string} Human readable name of the route
 */
 function getRouteName(url) {
    if (url == "/")
    {
        url += "root";
    }
    let routeSegments = url.split("/");
    // Filter the segments; ignore parameters
    routeSegments = routeSegments.filter(element => element.charAt(0) != ":");
    // Replace the separator "," with an underscore
    routeSegments = routeSegments.toString().replace(/[,]/gi, '_');
    return routeSegments;
}

module.exports = {
    handleRouterFile,
    loadedRoutes,
    loadedModules
}