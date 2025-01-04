import fs from "fs";
import path from "path";
import {execSync} from "child_process";
import {cloneRepo, pullRepo, removeGitDirectory} from "./git-utils";
import {loadInnerPackages} from "./file-utils";

export function init() {
    const filePath = path.resolve(process.cwd(), 'inner-packages.json');
    if (fs.existsSync(filePath)) {
        console.log('inner-packages.json already exists.');
        return;
    }

    const defaultConfig = {packages: []};
    fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
    console.log('Created inner-packages.json.');
}


export async function install(repoUrl) {
    if (repoUrl) {
        // Clonar un único repositorio
        const repoName = repoUrl.split('/').pop().replace('.git', '');
        await cloneRepo(repoUrl, repoName);
        removeGitDirectory(repoName);
        return;
    }

    // Instalar desde inner-packages.json
    const {packages} = loadInnerPackages();
    for (const {name, repo, at = 'main'} of packages) {
        await cloneRepo(repo, name, at);
        removeGitDirectory(name);
    }
}


export async function update() {
    const {packages} = loadInnerPackages();
    for (const {name} of packages) {
        console.log(`Updating ${name}...`);
        await pullRepo(name);
    }
}
