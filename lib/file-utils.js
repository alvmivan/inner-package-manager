import fs from "fs";
import path from "path";


export function loadJson(path, defaultValue = {}) {
    if (!fs.existsSync(path)) {
        return defaultValue;
    }
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

export function writeJson(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

export function loadInnerPackages(preComputedConfigPath) {

    const configPath = preComputedConfigPath ?? path.resolve(process.cwd(), 'inner-packages.json');
    const defaultValue = {packages: [], excludeOnInstall: [], tracking: []};
    // merge into default so there is no missing fields
    return {...defaultValue, ...(loadJson(configPath, defaultValue))};
    
}


const modes = {
    'replace': '(default) : will replace the existing values with the new ones',
    'merge': '(only used if the value is a json object) will merge the new values with the existing ones',
    'rev-merge': '(only used if the value is a json object), will make a merge but prioritizing the old values',
    'append': '(only used if the value is an array) will append the new values to the existing ones',
    'prepend': '(only used if the value is an array) will prepend the new values to the existing ones',
    'remove': 'will remove the key from the json (here the value is ignored)'
}

export function updateJson(path, key, value, mode = 'replace') {

    if (!modes[mode]) {
        throw new Error(`Invalid mode: ${mode}. Available modes are: ${JSON.stringify(modes, null, 4)}`);
    }

    //key must be a string 
    if (typeof key !== 'string') {
        throw new Error(`Invalid key. Key must be a string.`);
    }

    //validate data types    
    if (mode === 'remove' && typeof value !== 'undefined') {
        throw new Error(`Invalid value for mode 'remove'. Value must be null or undefined.`);
    }

    if (mode === 'replace' && typeof value === 'undefined') {
        throw new Error(`Invalid value for mode 'replace'. Value must be an object or an array, if you attempt to delete the key use mode 'remove' instead.`);
    }

    if (mode === 'merge' || mode === 'rev-merge') {
        if (typeof value !== 'object') {
            throw new Error(`Invalid value for mode '${mode}'. Value must be an JSON object.`);
        }
    }

    if (mode === 'append' || mode === 'prepend') {
        if (!Array.isArray(value)) {
            throw new Error(`Invalid value for mode '${mode}'. Value must be an array.`);
        }
    }

    const data = loadJson(path);


    const dataType = typeof data[key];
    const stringifyData = JSON.stringify(data, null, 4);
    // now validate modes with the current data
    if (mode === 'append' || mode === 'prepend') {
        if (!Array.isArray(data[key])) {
            throw new Error(`Invalid mode '${mode}'. Key must be pointing an array, and it is pointing to a ${dataType} -> \n${stringifyData}`);
        }
    }

    if (mode === 'merge' || mode === 'rev-merge') {
        if (dataType !== 'object') {
            throw new Error(`Invalid mode '${mode}'. Key must be pointing an object, and it is pointing to a ${dataType} -> \n${stringifyData}`);
        }
    }

    if (mode === 'remove') {
        if (typeof data[key] === 'undefined') {
            console.warn(`Warning: Key ${key} does not exist in the json -> \n${stringifyData}`);
        }
    }


    if (mode === 'merge') data[key] = {...data[key], ...value};
    else if (mode === 'rev-merge') data[key] = {...value, ...data[key]};
    else if (mode === 'append') data[key] = [...data[key], ...value];
    else if (mode === 'prepend') data[key] = [...value, ...data[key]];
    else if (mode === 'remove') delete data[key];
    else data[key] = value;

    writeJson(path, data);

}