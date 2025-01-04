import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";

export async function cloneRepo(repoUrl, targetDir, branch = 'main') {
    const git = simpleGit();
    const targetPath = path.resolve(process.cwd(), targetDir);

    if (!fs.exists(targetPath)) {
        console.log(`Cloning ${repoUrl} into ${targetPath}...`);
        await git.clone(repoUrl, targetPath, ['--branch', branch, '--single-branch']);
    } else {
        console.log(`Directory ${targetDir} already exists. Skipping.`);
    }
}

export function removeGitDirectory(dir) {
    const gitPath = path.resolve(dir, '.git');
    if (fs.exists(gitPath)) {

        fs.remove(gitPath, err => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Removed .git directory from ${dir}`);
        });
    }
}

export async function pullRepo(targetDir) {
    const git = simpleGit(targetDir);
    await git.pull();
}
