## Inner Package Manager

### Installation

```bash
npm i inner-package-manager
```


### Description

The idea behind this project
is to provide a way to handle dependencies
that will be tracked by git.


### How to use
First of all, you will need a file called `inner-packages.json` in the root of your project.
This file will contain the dependencies of your project.


```json
{
  "packages": [
    {
      "name": "your-package-name",
      "repo": "https://github.com/your-github-user/your-repo-name.git",
      "at": "master"
    }
  ]
}
```

_note_: The `at` field is optional, you can use it to specify a branch, tag or commit hash.



To create an `inner-packages.json` file for you if not exists you can run the following command.
```bash
npm inner init
```

Then run the following command to install the required dependencies.

```bash
npm inner install
```

To install a certain package you can run the following command.

```bash
npm inner install your-github-repo-url
```



### Under the hood
The tool will clone the repository at the given branch, tag or commit hash.
Then it will copy the files from the cloned repository to the root of your project.
But excluding the `.git`
This also will look for a package.json file (if exists) in the root of the cloned repository and will install the dependencies of the cloned repository.
As well as the dependencies on an inner-packages.json file in the cloned repository.




