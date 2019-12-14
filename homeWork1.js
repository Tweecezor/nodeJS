const fs = require('fs');
const path = require('path');
const del = require('del');


// const rs = fs.createReadStream('./file.txt',{encoding:'utf8'});
// const ws = fs.createWriteStream('./newFile.txt');

// rs.on('data',data=>{
//     console.log(data);
// })



var [ srcFolder ,newFolder, deleteStatus ] = process.argv.slice(2);


const _path = path.join(__dirname,srcFolder);

const readDir = (base,level) => {
    const folders = fs.readdirSync(base);
    folders.forEach(item=>{
        let localBase = path.join(base, item);
        let newMainFolder = path.join(__dirname,newFolder);
        let state = fs.statSync(localBase);
        if (state.isDirectory()) {
            if(item !== '.DS_Store' ){
                if (!fs.existsSync(newMainFolder)){
                    fs.mkdirSync(newMainFolder);
                }
                readDir(localBase, level + 1);
            }
          } else {
                if(item != '.DS_Store') {
                    const newDir = path.join ( newMainFolder , item.slice(0,1) )
                    if (!fs.existsSync( newDir.toUpperCase() )){
                        fs.mkdirSync(newDir.toUpperCase());
                    }
                    fs.link(localBase,path.join(newDir,item),err=>{
                        if (err) {
                            console.error(err.message);
                            return;
                          }
                    });
                }
          }
    })
}


readDir(_path,0);
if(deleteStatus == 'true'){
    del([path.join(__dirname,srcFolder)]);
}