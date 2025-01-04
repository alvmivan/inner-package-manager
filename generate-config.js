import fs from "fs";

const filePath = 'inner-packages.json';

if (!fs.existsSync(filePath)) {
    const content = JSON.stringify({packages: []}, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`${filePath} has been created.`);
} else {
    console.log(`${filePath} already exists.`);
}