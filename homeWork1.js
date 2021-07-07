const fs = require("fs");
const path = require("path");
const del = require("del");
const minimist = require("minimist");

var { srcFolder, newFolder, deleteStatus } = minimist(process.argv.slice(2));

var count = 0;

const _path = path.join(__dirname, srcFolder);

function mainFunction(cb) {
  readDir(_path);
  cb();
}

const readDir = base => {
  console.log(`count = ${count++}`);
  const folders = fs.readdirSync(base);
  folders.forEach(item => {
    if (item !== ".DS_Store") {
      console.log(item);
      let localBase = path.join(base, item);

      let newMainFolder = path.join(__dirname, newFolder);

      state = fs.statSync(localBase);
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
        console.log("safdsgre");
        fs.link(localBase, path.join(newDir, item), () => {
          if (fs.existsSync(path.join(__dirname, srcFolder))) {
            console.log("before delete");
            if (deleteStatus == "true") {
              console.log("deleted");
              del([path.join(__dirname, srcFolder)]);
            }
          }
        });
      }
    }
  });
};

function createNewFolder(base, item) {
  console.log("ff");
}

mainFunction(() => {
  console.log("CBCBCBCBCBCB");
});
