import fs from "fs-extra";
import path from "path";
import {cloneRepo, pullRepo} from "./git-utils.js";
import {loadInnerPackages, loadJson, writeJson} from "./file-utils.js";
import {exec} from "child_process";

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

    const currentPackageConfig = loadInnerPackages(path.resolve(repoDirectory, 'inner-packages.json'));
    const packageJson = loadJson(path.resolve(repoDirectory, 'package.json'), {dependencies: {}});

    if (fs.exists(path.resolve(repoDirectory, 'inner-packages.json'))) {
        await installMany(currentPackageConfig.packages);
    }
    const {excludeOnInstall} = currentPackageConfig;
    if (excludeOnInstall) {
        // aca hay nombres de archivos o carpetas que tenemos que borrar (acá van a aparecer relatives, tenemos que armar el path de cada uno)
        for (const item of excludeOnInstall) {
            const itemPath = path.resolve(repoDirectory, item);
            if (fs.exists(itemPath)) {
                await fs.remove(itemPath, err => err ?
                    console.error(`error removing file or dir: ${itemPath} -> ${err}`) :
                    console.log(`Removed ${itemPath}`));
            }
        }
    }

    // package json has many dependencies as keys, it's the npm package.json, just copy them into the current package.json dependencies
    const {dependencies} = packageJson;
    const currentPackageJson = loadJson(path.resolve(process.cwd(), 'package.json'), {dependencies: {}});
    // merge dependencies
    const mergedDependencies = {...currentPackageJson.dependencies, ...dependencies};
    // write the new package.json
    writeJson(path.resolve(process.cwd(), 'package.json'), {dependencies: mergedDependencies});

    // add the repo to the tracking list
    const {tracking} = loadInnerPackages();
    tracking.push({repo: repoDirectory, path: repoDirectory});
    writeJson(path.resolve(process.cwd(), 'inner-packages.json'), {packages: currentPackageConfig.packages, tracking});


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

    //run npm install
    console.log('Running npm install...');

    await new Promise((resolve, reject) => {
        exec('npm install', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            } else {
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            }
            resolve(); // resolve the promise anyway
        });
    });

    console.log('npm install finished.');
}


export async function update() {
    const {packages} = loadInnerPackages();
    for (const {name} of packages) {
        console.log(`Updating ${name}...`);
        await pullRepo(name);
    }
}
