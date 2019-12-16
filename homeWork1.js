const fs = require("fs");
const path = require("path");
const del = require("del");
const minimist = require("minimist");

var { srcFolder, newFolder, deleteStatus } = minimist(process.argv.slice(2));

const _path = path.join(__dirname, srcFolder);

const readDir = base => {
  const folders = fs.readdirSync(base);
  folders.forEach(item => {
    if (item !== ".DS_Store") {
      createNewFolder(base, item);
    }
  });
};

function createNewFolder(base, item) {
  let localBase = path.join(base, item);

  let newMainFolder = path.join(__dirname, newFolder);

  let state = fs.statSync(localBase);

  if (state.isDirectory()) {
    if (!fs.existsSync(newMainFolder)) {
      fs.mkdirSync(newMainFolder);
    }
    readDir(localBase);
  } else {
    const newDir = path.join(newMainFolder, item.slice(0, 1));

    if (!fs.existsSync(newDir.toUpperCase())) {
      fs.mkdirSync(newDir.toUpperCase());
    }
    fs.linkSync(localBase, path.join(newDir, item), err => {
      if (err) {
        console.error(err.message);
        return;
      }
    });
  }
}

readDir(_path, 0);

if (deleteStatus == "true") {
  del([path.join(__dirname, srcFolder)]);
}
