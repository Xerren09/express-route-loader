const fs = require("fs");
const path = require("path");
const search = require("./lib/search");
const loadedModules = require("./lib/routers").loadedModules;
const loadedRoutes = require("./lib/routers").loadedRoutes;

const settings = {
    modulesRootFolderPath: "",
    prefix: "",
    exclusions: [],
    logger: {}
}

function setOptions (options={}) {
    if (options.routesFolder)
    {
        if (!path.isAbsolute(options.routesFolder))
        {
            options.routesFolder = path.resolve(options.routesFolder);
        }
        settings.modulesRootFolderPath = options.routesFolder;
    }
    else
    {
        settings.modulesRootFolderPath = path.join(process.cwd(), "routes");
    }
    if (options.exclusions)
    {
        settings.exclusions = options.exclusions;
    }
    if (options.prefix)
    {
        settings.prefix = options.prefix;
    }
    if (options.logger)
    {
        settings.logger = options.logger;
    }
    else
    {
        settings.logger = require("./lib/logger");
    }
    settings.logger.info(`Route-loader settings have been loaded:`, settings);
}

/**
 * @typedef router
 * @type {object}
 * @property {string} instance The route module instance loaded in (same as require(module)).
 * @property {string} path The absolute filesystem path pointing to the route module file.
 * @property {string} mountURL The URL under which the module's routes have been mounted.
 * @property {string} routes List of routes that are declared in the module, as processed by this library.
 */

/**
 * Searches a given directory (defaults to `path.join(process.cwd(), "/routes")` and all of it's subdirectories for Express Router modules, and mounts them to the ExpressApp at an URL created from the modules' access path.
 * 
 * @param {ExpressApp} app The `Express App` instance running the application.
 * @param {Object} options Options for the module.
 * @param {String} options.routesFolder Path to the directory containing the route modules and routing structure.
 * @param {Array.<string>} options.exclusions Path to the directory containing the route modules and routing structure.
 * @param {String} options.prefix A prefix prepended to every URL.
 * @param {LoggerInstance} options.logger The logger instance used by script. Winston compatible. If none is provided it defaults to the script's internal logger.
 * @param {String} options.logFolderPath Only used by the internal logger, defines where log files are saved. Defaults to `path.join(process.cwd(), "/Logs/routesBuilder")`.
 * @param {function(router):void} callback Callback fired for every valid file loaded. Returns the module's assigned URL and absolute file system path.
 */
function load (app, options={}, callback=()=>{}) {
    setOptions(options);
    // Check if the searchpath exists; abort if not
    if (fs.existsSync(settings.modulesRootFolderPath))
    {
        search.scan(app, settings, callback);
    }
    else
    {
        // Path for routesFolder is invalid. Kill it.
        const rootFolderError = new Error(`Invalid source folder path : ${settings.modulesRootFolderPath}, loader can not load routes from nonexistent folder.`);
        settings.logger.error(rootFolderError.message, rootFolderError.stack);
        throw rootFolderError;
    }
}

module.exports = {
    load,
    loadedRoutes,
    loadedModules
};