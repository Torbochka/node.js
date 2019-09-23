const utils = require("./utils");
const fs = require("fs");
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
  async filePath => {
    const fileName = filePath.split("/").pop();
    const folderPath = path.join(argv.d, fileName.charAt(0).toUpperCase());
    try {
      await utils.checkDir(folderPath);
      await utils.cpFile(filePath, path.join(folderPath, fileName));

      if (argv.r) {
        await utils.deleteFile(filePath);
      }
    } catch (e) {
      console.log(e);
    }
  },
  async dir => {
    if (argv.r) {
      try {
        await utils.deleteDir(dir);
      } catch (e) {
        console.log(e);
      }
    }
  },
  err => {
    console.log("Error: ", err);
  }
);
