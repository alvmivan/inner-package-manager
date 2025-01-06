import fs from "fs-extra";
import path from "path";
import {cloneRepo, pullRepo} from "./git-utils.js";
import {loadInnerPackages, loadJson, updateJson} from "./file-utils.js";
import {exec} from "child_process";

const defaultConfig = {
    "packages": [],
    "inherit-packages": [],
    "tracking": []
};
const defaultReposLocation = 'repos';

export function isAlreadyInstalled(repoUrl) {
    const {tracking} = loadInnerPackages();
    return tracking.includes(repoUrl);
}


export function init() {
    const filePath = path.resolve(process.cwd(), 'inner-packages.json');
    if (fs.exists(filePath)) {
        console.log('inner-packages.json already exists.');
        return;
    }


    fs.write(filePath, JSON.stringify(defaultConfig, null, 4));
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


    const {dependencies} = packageJson;
    updateJson(path.resolve(process.cwd(), 'package.json'), 'dependencies', dependencies, "join");

    const newTracking = [repoDirectory];
    updateJson(path.resolve(process.cwd(), 'inner-packages.json'), 'tracking', newTracking, "add");


}


async function installRepo(repoUrl, targetDir) {
    // Clonar un único repositorio
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const directory = await cloneRepo(repoUrl, repoName, targetDir);
    await postClone(directory);

}

async function installMany(packages) {
    // Instalar desde inner-packages.json
    for (const {repo, at, targetDir = defaultReposLocation} of packages) {

        const repoUrl = at ? `${(repo.replace('.git', ''))}#${at}.git` : repo;
        if (isAlreadyInstalled(repoUrl)) {
            console.log(`Repository ${repoUrl} is already installed.`);
            continue;
        }
        await installRepo(repoUrl, targetDir);
    }
}

export async function install(repoUrl) {
    if (repoUrl) {
        await installRepo(repoUrl, defaultReposLocation);

    } else {
        await installMany(loadInnerPackages().packages);
    }

    //run npm install
    console.log('\n\nRunning npm install...\n\n');

    await new Promise((resolve) => {
        exec('npm install', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            } else {
                console.log(`stdout: ${stdout}`);
            }
            resolve(); // resolve the promise anyway
        });
    });

    console.log('\n\nnpm install finished.\n\n');
}

 