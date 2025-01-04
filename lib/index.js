import fs from "fs-extra";
import path from "path";
import {cloneRepo, pullRepo} from "./git-utils.js";
import {loadInnerPackages} from "./file-utils.js";


const defaultConfig = {
    "packages": [],
    "inherit-packages": [],
    "tracking": []
};

/*
*  el campo tracking va a mantener un registro de los repositorios ya clonados
* mapeando su nombre, con el { "repo", "path" } 
* */


export function isAlreadyInstalled(repoUrl) {
    const {tracking} = loadInnerPackages();
    return tracking.some(item => item.repo === repoUrl);
}


export function init() {
    const filePath = path.resolve(process.cwd(), 'inner-packages.json');
    if (fs.existsSync(filePath)) {
        console.log('inner-packages.json already exists.');
        return;
    }


    fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 4));
    console.log('Created inner-packages.json.');
}


async function postClone(repoDirectory) {

    const innerPackagesPath = path.resolve(repoDirectory, 'inner-packages.json');
    const currentPackageConfig = loadInnerPackages(innerPackagesPath);

    if (fs.exists(innerPackagesPath)) {
        await installMany(currentPackageConfig.packages);
    }
    const {excludeOnInstall} = currentPackageConfig;
    if (excludeOnInstall) {
        // aca hay nombres de archivos o carpetas que tenemos que borrar (acá van a aparecer relatives, tenemos que armar el path de cada uno)
        for (const item of excludeOnInstall) {
            const itemPath = path.resolve(repoDirectory, item);
            if (fs.exists(itemPath)) 
                fs.remove(itemPath, err => err ? console.error(err) : console.log(`Removed ${itemPath}`));
        }
    }

}


async function installRepo(repoUrl) {
    // Clonar un único repositorio
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const directory = await cloneRepo(repoUrl, repoName);
    await postClone(directory);

}

async function installMany(packages) {
    // Instalar desde inner-packages.json
    for (const {repo, at} of packages) {

        const repoUrl = at ? `${(repo.replace('.git', ''))}#${at}.git` : repo;
        await installRepo(repoUrl);

    }
}

export async function install(repoUrl) {
    if (repoUrl) {
        await installRepo(repoUrl);

    } else {
        await installMany(loadInnerPackages().packages);
    }


}


export async function update() {
    const {packages} = loadInnerPackages();
    for (const {name} of packages) {
        console.log(`Updating ${name}...`);
        await pullRepo(name);
    }
}
