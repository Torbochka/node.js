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
    const d = new Date();

    let sum = 0;
    if (req.url === "/") {
      console.log("HTTP server running..");
      const interval = setInterval(() => {
        console.log(d.toUTCString());
        sum += argv.i;
        if (sum >= argv.p) {
          clearInterval(interval);
          console.log("Date output stopped");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(d.toUTCString());
        }
      }, argv.i);
    }
  })
  .listen(3000);
