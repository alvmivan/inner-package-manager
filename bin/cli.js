#!/usr/bin/env node

// some change here
import {program} from "commander";

import {init, install} from "../lib/index.js";

// some change here
program
    .command('init')
    .description('Create an inner-packages.json file if it does not exist.')
    .action(init);

program
    .command('install [repo]')
    .description('Install packages from inner-packages.json or a specific repository URL.')
    .action(install);

// some change here
program.parse(process.argv);
