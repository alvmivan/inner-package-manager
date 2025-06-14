import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";


export function getRepoDesiredLocation(repoName, targetDir) {
    const rootPath = path.resolve(process.cwd(), targetDir);
    return path.resolve(rootPath, repoName);
}

export async function cloneRepo(repoUrl, repoName, targetDir) {
    const branch = 'main'
    const targetPath = getRepoDesiredLocation(repoName, targetDir);

    fs.ensureDirSync(targetPath, {recursive: true});
    fs.emptyDirSync(targetPath);


    const git = simpleGit();
    await git.clone(repoUrl, targetPath, ['--branch', branch, '--single-branch']);

    console.log(`Cloned ${repoUrl} to ${targetPath}`);

    //remove the .git directory
    await removeGitDirectory(targetPath);

    return targetPath;
}

export async function removeGitDirectory(dir) {
    const gitPath = path.resolve(dir, '.git');
    if (fs.exists(gitPath)) {
        await fs.remove(gitPath);
        console.log(`Removed .git directory from ${dir}`);
    }
}

export async function pullRepo(repoName) {

    const targetDir = path.resolve(process.cwd(), 'repos', repoName);
    const git = simpleGit(targetDir);
    await git.pull();
}
