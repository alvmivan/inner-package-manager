import fs from "fs";
import path from "path";

export function loadInnerPackages() {
    const configPath = path.resolve(process.cwd(), 'inner-packages.json');
    if (!fs.existsSync(configPath)) {
        throw new Error('inner-packages.json not found!');
    }

    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}
