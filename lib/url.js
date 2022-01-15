const path = require("path");

/**
 * Converts the relative difference between two folders (base <-> target) into a valid URL format.
 * @param {String} rootFolder The root folder from where relative paths are calculated
 * @param {String} filePath The path pointing to the file we want the relative path to point to
 * @returns {String} The difference between the `rootFolder` and `filePath` in an URL format
 */
function pathToURL (rootFolder, filePath) {
    // Get the relative path between the rootFolder and the given file within; this is used as an URL
    let URLPath = path.win32.relative(rootFolder, filePath);
    // Convert the WIN32 path format to POSIX-like so it can be used as an URL.
    // The built-in path.posix doesn't work due to some quirks with relative path handling.
    URLPath = URLPath.replace(/[\\\\]/gi, '/');
    // Remove the filename from the path
    const fileNameCutoffIndex = URLPath.lastIndexOf('/');
    if (fileNameCutoffIndex == -1)
    {
        URLPath = "";
    }
    else
    {
        URLPath = URLPath.slice(0, URLPath.lastIndexOf('/'));
    }
    // Add starting slash to the URL
    const URL = `/${URLPath}`;
    return URL;
}

/**
 * Parses parameters (`:param`) out of an Express Router URL and returns them as an ordered array.
 * @param {string} url A route URL as expressed in the router module
 * @returns {Array.<string>} Ordered list of URL parameters
 */
function getURLParameters (url) {
    const paramRegex = new RegExp(/([:])\w+/g);
    let params = [...url.matchAll(paramRegex)].map(element => element[0].substring(1));
    return params;
}

/**
 * Joins all the segments together and normalises them into a valid URL formatted string.
 * @param  {...string} segments URL segments 
 * @returns {string} Valid URL generated from the given segments
 */
function buildURL (...segments) {
    let fullURL = "/";
    segments.forEach(element => {
        if (element !== "/")
        {
            if (!element.endsWith("/"))
            {
                element += "/";
            }
            element = element.replace(/^\//g, "");
            fullURL += element;
        }
    });
    return fullURL;
}

module.exports = {
    getURLParameters,
    pathToURL,
    buildURL,
}