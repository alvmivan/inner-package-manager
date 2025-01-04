#!/usr/bin/env node

import {program} from "commander";

import {init, install, update} from "../lib/index.js";


program
    .command('init')
    .description('Create an inner-packages.json file if it does not exist.')
    .action(init);

program
    .command('install [repo]')
    .description('Install packages from inner-packages.json or a specific repository URL.')
    .action(install);

program
    .command('update')
    .description('Update all installed packages.')
    .action(update);

program.parse(process.argv);
