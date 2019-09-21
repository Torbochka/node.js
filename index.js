const fs = require("fs");
const path = require("path");
const argv = require("yargs")
  .usage("Usage: $0 -s [string] -d [string] ")
  .example("$0 -s ./foo -d ./bar -r", "count the lines in the given file")
  .demandOption(["s", "d"])
  .alias("s", "src")
  .alias("d", "dest")
  .alias("r", "remove")
  .describe("s", "Source folder")
  .describe("d", "Destination folder")
  .describe("r", "Delete source folder")
  .boolean(["r"])
  .help("h")
  .alias("h", "help").argv;

const checkDir = (dest, cb) => {
  fs.stat(dest, err => {
    if (err && err.code === "ENOENT") {
      fs.mkdir(dest, cb);
    } else {
      cb(err);
    }
  });
};

const deleteFile = file => {
  fs.unlink(file, err => {
    if (err) {
      throw err;
    }
  });
};

const deleteDir = dir => {
  fs.rmdir(dir, err => {
    if (err) {
      throw err;
    }
  });
};

const copyFile = (source, target, cb) => {
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
};

const walk = (dir, callbackOnFile, callbackOnFolder, done) => {
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
          walk(
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
};

walk(
  argv.s,
  (filePath, cb) => {
    const fileName = filePath.split("/").pop();
    const folderPath = path.join(argv.d, fileName.charAt(0).toUpperCase());

    checkDir(folderPath, err => {
      if (err) {
        console.log(err);
      } else {
        copyFile(filePath, path.join(folderPath, fileName), err => {
          console.log("done", err);
        });

        if (argv.r) {
          deleteFile(filePath);
        }

        cb();
      }
    });
  },
  dir => {
    if (argv.r) {
      deleteDir(dir);
    }
  },
  err => {
    console.log("Error: ", err);
  }
);

module.exports = walk;
