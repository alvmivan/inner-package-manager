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
    return loadJson(configPath, {packages: [] , excludeOnInstall: []});
}
