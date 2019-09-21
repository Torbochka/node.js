const utils = require("./utils");
const path = require("path");
const argv = require("yargs")
  .usage("Usage: $0 -s [string] -d [string] ")
  .example("$0 -s ./foo -d ./bar")
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

utils.walk(
  argv.s,
  (filePath, cb) => {
    const fileName = filePath.split("/").pop();
    const folderPath = path.join(argv.d, fileName.charAt(0).toUpperCase());

    utils.checkDir(folderPath, err => {
      if (err) {
        console.log(err);
      } else {
        utils.copyFile(filePath, path.join(folderPath, fileName), err => {
          if (err) {
            console.log(err);
          } else {
            if (argv.r) {
              utils.deleteFile(filePath, cb);
            }
          }
        });
      }
    });
  },
  dir => {
    if (argv.r) {
      utils.deleteDir(dir);
    }
  },
  err => {
    console.log("Error: ", err);
  }
);
