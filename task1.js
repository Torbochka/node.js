const http = require("http");
const argv = require("yargs")
  .usage("Usage: $0 -i [num] -p [num] ")
  .example("$0 -i 5 -p 60")
  .demandOption(["i", "p"])
  .alias("i", "interval in miliseconds")
  .alias("p", "period in miliseconds")
  .describe("i", "Interval output to console current date")
  .describe("p", "Time interval between output to console current date")
  .help("h")
  .alias("h", "help").argv;

http
  .createServer((req, res) => {
    const expMs = Date.now() + argv.p;

    if (req.url === "/") {
      console.log("HTTP server running..");
      const interval = setInterval(() => {
        const ms = Date.now();
        console.log(new Date(ms).toUTCString());

        if (ms >= expMs) {
          clearInterval(interval);
          console.log("Date output stopped");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(new Date().toUTCString());
        }
      }, argv.i);
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end();
    }
  })
  .listen(3000);
