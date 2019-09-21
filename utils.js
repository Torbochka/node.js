const fs = require("fs");
const path = require("path");

module.exports = {
  checkDir(dest, cb) {
    fs.stat(dest, err => {
      if (err && err.code === "ENOENT") {
        fs.mkdir(dest, cb);
      } else {
        cb(err);
      }
    });
  },

  deleteFile(file, cb) {
    fs.unlink(file, err => {
      if (err) {
        console.log(err);
      } else {
        cb();
      }
    });
  },

  deleteDir(dir) {
    fs.rmdir(dir, err => {
      if (err) {
        throw err;
      }
    });
  },

  copyFile(source, target, cb) {
    let cbCalled = false;

    const rd = fs.createReadStream(source);
    rd.on("error", err => done(err));

    const wr = fs.createWriteStream(target);
    wr.on("error", err => done(err)).on("close", () => done(null));

    rd.pipe(wr);

    function done(err) {
      if (!cbCalled) {
        cb(err);
        cbCalled = true;
      }
    }
  },

  walk(dir, callbackOnFile, callbackOnFolder, done) {
    fs.readdir(dir, (err, list) => {
      if (err) return done(err);
      let i = 0;

      const nextDir = doneList => {
        if (err) return doneList(err);

        let filePath = list[i++];

        if (!filePath) return doneList(null);

        filePath = path.join(dir, filePath);

        fs.stat(filePath, (_, stat) => {
          if (stat && stat.isDirectory()) {
            this.walk(
              filePath,
              callbackOnFile,
              callbackOnFolder,
              nextDir.bind(null, doneList)
            );
          } else {
            callbackOnFile(filePath, nextDir.bind(null, doneList));
          }
        });
      };

      nextDir(err => {
        if (!err) callbackOnFolder(dir);
        done(err);
      });
    });
  }
};
