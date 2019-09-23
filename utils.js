const fs = require("fs");
const path = require("path");
const util = require("util");
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const unlink = util.promisify(fs.unlink);
const rmdir = util.promisify(fs.rmdir);
const readdir = util.promisify(fs.readdir);

module.exports = {
  async checkDir(dest) {
    try {
      return await stat(dest);
    } catch (e) {
      if (e.code === "ENOENT") {
        return await mkdir(dest);
      } else {
        throw e;
      }
    }
  },

  deleteFile(file) {
    return unlink(file);
  },

  deleteDir(dir) {
    return rmdir(dir);
  },

  cpFile(source, target) {
    return new Promise((resolve, reject) => {
      const rd = fs
        .createReadStream(source)
        .on("close", () => {
          resolve();
        })
        .on("error", err => reject(err));

      const wr = fs
        .createWriteStream(target)
        .on("close", () => resolve())
        .on("error", err => reject(err));

      rd.pipe(wr);
    });
  },

  async walk(dir, callbackOnFile, callbackOnFolder, done) {
    try {
      let list = await readdir(dir);

      for (const it of await list) {
        const filePath = path.join(dir, it);
        let stats = await stat(filePath);

        if (stats && stats.isDirectory()) {
          await this.walk(filePath, callbackOnFile, callbackOnFolder, done);
          await callbackOnFolder(filePath);
        } else {
          await callbackOnFile(filePath);
        }

        callbackOnFolder(dir);
      }
    } catch (e) {
      done(e);
    }
  }
};
