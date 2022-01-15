const fs = require("fs");
const path = require("path");
const routers = require("./routers");

const dotUnderscoreMatch = new RegExp(/^_|^\.+/g);

var exclusions = ["node_modules"];

function isExcluded (fileOrFolderName="") {
    let excluded = false;
    if (fileOrFolderName.endsWith(".js"))
    {
        if (dotUnderscoreMatch.test(fileOrFolderName)) // return true if the the filename starts with a . or _
        {
            excluded = true;
        }
        else
        {
            // Remove the extension(s) to test for filename
            fileOrFolderName = fileOrFolderName.split(".")[0];
            for (let i = 0; i < exclusions.length; i++) // Loop through the exclusions. This is probably slower than Array.includes but an exclusion can be a regex value so we need to test for those too.
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

function scan (app, settings, callback=function(){}) {
    exclusions = exclusions.concat(settings.exclusions);
    recursiveDirectorySearch(app, settings, settings.modulesRootFolderPath, callback);
}

function recursiveDirectorySearch(app, settings, searchPath, callback) {
    settings.logger.info(`Searching directory ${searchPath}`);
    // Read all files - including folders - in the searchPath
    fs.readdirSync(searchPath).forEach((element) => {
        // check if the file / folder's name is in the exclusion list; if it is ignores it.
        if (isExcluded(element) == false)
        {
            // element returns only the file name, append to the absolute path here
            let fullRouteFilePath = path.join(searchPath, element);
            // if the path points to a folder, call the function again to search it's contents.
            // this will go through all the files in the given folder, and recursively search all subfolders
            if (fs.statSync(fullRouteFilePath).isDirectory())
            {
                recursiveDirectorySearch(app, settings, fullRouteFilePath, callback);
            }
            else
            {
                routers.handleRouterFile(app, settings, fullRouteFilePath, callback);
            }
        }
    });
}

module.exports = {
    scan
};