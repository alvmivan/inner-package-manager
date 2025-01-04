import fs from "fs";
import path from "path";

export function loadInnerPackages(preComputedConfigPath) {
    const configPath = preComputedConfigPath ?? path.resolve(process.cwd(), 'inner-packages.json');
    if (!fs.existsSync(configPath)) {
        return {packages: []};
    }

    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}
