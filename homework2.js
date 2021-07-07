const fs = require("fs");
const path = require("path");
const del = require("del");
const minimist = require("minimist");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const link = util.promisify(fs.link);
const stat = util.promisify(fs.stat);
const exist = util.promisify(fs.exists);
const mkDir = util.promisify(fs.mkdir);

var { srcFolder, newFolder, deleteStatus } = minimist(process.argv.slice(2));

const _path = path.join(__dirname, srcFolder);

const readDir = async (base, res) => {
  const folders = await readdir(base);
  folders.forEach(async item => {
    if (item !== ".DS_Store") {
      await createNewFolder(base, item, res);
    }
  });
};

async function createNewFolder(base, item, res) {
  let localBase = path.join(base, item);

  let newMainFolder = path.join(__dirname, newFolder);

  let state = await stat(localBase);

  if (state.isDirectory()) {
    let fileExist = await exist(newMainFolder);

    if (!fileExist) {
      try {
        await mkDir(newMainFolder);
      } catch (err) {}
    }
    await readDir(localBase, res);
  } else {
    const newDir = path.join(newMainFolder, item.slice(0, 1));
    let fileExist = await exist(newDir.toUpperCase());
    if (!fileExist) {
      try {
        await mkDir(newDir.toUpperCase());
      } catch (err) {}
    }
    await link(localBase, path.join(newDir, item));
    res();
  }
}

async function fn() {
  return new Promise(async (res, rej) => {
    await readDir(_path, res);
  });
}
var fnAvoid = fn();
fnAvoid.then(() => {
  if (deleteStatus == "true") {
    del([path.join(__dirname, srcFolder)]);
  }
});

// setTimeout(() => {
//   del([path.join(__dirname, srcFolder)]);
// }, 3000);

// var voit = fnAvoid();
// voit.then(res => console.log(res));
// mainFunction();

// const fn = () => {
//   return new Promise((res, rej) => {
//     const folders = fs.readdirSync(_path);
//     res(folders);
//   });
// };

// async function wrapper(base) {
//   let folders = await fn();
//   console.log(folders);
//   folders.forEach(async item => {
//     if (item !== ".DS_Store") {
//       createNewFolder(base, item);
//     }
//   });
// }
// wrapper(_path);

//   var state = await stat(localBase);
//   if (state.isDirectory()) {
//     let fileExist = await exist(newMainFolder);
//     if (!fileExist) {
//       fs.mkdirSync(newMainFolder);
//     }
//     readDir(localBase);
//   } else {
//     let fileExist = await exist(newDir);
//     if (!fileExist) {
//       fs.mkdir(newDir);
//     }
//     await link(localBase, path.join(newDir, item));
//     console.log("Done");
//   }
