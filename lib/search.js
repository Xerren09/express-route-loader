const fs = require("fs");
const path = require("path");
const routers = require("./routers");

const dotUnderscoreMatch = new RegExp(/^_|^\.+/g);

var exclusions = ["node_modules"];

/**
 * Loads in exclusions and then starts the diretcory search
 * @param {*} app ExpressApp
 * @param {*} settings Settings used by the library
 * @param {*} callback Callback to pass down to the routers.js
 */
function scan (app, settings, callback=function(){}) {
    exclusions = exclusions.concat(settings.exclusions);
    recursiveDirectorySearch(app, settings, settings.modulesRootFolderPath, callback);
}
/**
 * Recursively searches all folders and files in the given path
 * @param {*} app ExpressApp
 * @param {*} settings Library settings
 * @param {*} searchPath The root folder to search in this cycle
 * @param {*} callback Callback to pass down to the routers.js
 */
function recursiveDirectorySearch(app, settings, searchPath, callback) {
    settings.logger.info(`Searching directory ${searchPath}`);
    // Read all files - including folders - in the searchPath
    fs.readdirSync(searchPath).forEach((element) => {
        // check if the file / folder's name is in the exclusion list
        if (isExcluded(element) == false)
        {
            let fullFilePath = path.join(searchPath, element);
            if (fs.statSync(fullFilePath).isDirectory())
            {
                recursiveDirectorySearch(app, settings, fullFilePath, callback);
            }
            else
            {
                routers.handleRouterFile(app, settings, fullFilePath, callback);
            }
        }
    });
}

/**
 * Checks whether or not a given file or directory is excluded by the user or the library
 * @param {string} fileOrFolderName Name of the file or directory
 * @returns {boolean} `true` if the file or directory is exclused, `false` if it is not
 */
function isExcluded (fileOrFolderName="") {
    let excluded = false;
    if (fileOrFolderName.endsWith(".js"))
    {
        if (dotUnderscoreMatch.test(fileOrFolderName))
        {
            excluded = true;
        }
        else
        {
            // Remove the extension(s) to test for filename
            fileOrFolderName = fileOrFolderName.split(".")[0];
            for (let i = 0; i < exclusions.length; i++)
            {
                if (exclusions[i] == fileOrFolderName)
                {
                    excluded = true;
                    break;
                }
                else
                {
                    try // See if an exclusion is a valid regex value; then test it the filename if it is.
                    {
                        let regex = new RegExp(exclusions[i].toString());
                        if (regex.test(fileOrFolderName))
                        {
                            excluded = true;
                            break;
                        }
                    }
                    catch(e) {
                        // No logging because this is not a real error
                    }
                }
            }   
        }
    }
    return excluded;
}

module.exports = {
    scan
};