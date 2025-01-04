import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";

export async function cloneRepo(repoUrl, targetDir, branch = 'main') {
    const git = simpleGit();

    // place where we place the repos:
    const rootPath = path.resolve(process.cwd(), 'repos');
    if (!fs.exists(rootPath)) {
        await fs.mkdirpSync(rootPath, {recursive: true});
    }

    const targetPath = path.resolve(rootPath, targetDir);

    // if exists then erase the content and clone again

    if (fs.exists(targetPath)) {
        fs.removeSync(targetPath);
    }

    await git.clone(repoUrl, targetPath, ['--branch', branch, '--single-branch']);

    console.log(`Cloned ${repoUrl} to ${targetPath}`);
    
    //remove the .git directory
    removeGitDirectory(targetPath);
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

export async function pullRepo(repoName) {
    
    const targetDir = path.resolve(process.cwd(), 'repos', repoName);
    const git = simpleGit(targetDir);
    await git.pull();
}
