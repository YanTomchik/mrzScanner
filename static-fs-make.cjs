const fs = require('fs');
const path = require('path');
const list = require('./static-fs-list.json');

const storage = {};

list.forEach(function(f) {
  const srcPath = (f.baseDir) ? path.join(f.baseDir, f.name) : f.name;
  storage['/' + f.name] = {
    encoding: f.encoding,
    data: fs.readFileSync(srcPath, f.encoding)
  };
});

fs.writeFileSync('./static-fs-data.json', JSON.stringify(storage));
