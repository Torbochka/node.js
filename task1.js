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

let interval;
let timeout;

http
  .createServer((req, res) => {
    const d = new Date();

    if (req.url === "/") {
      console.log("HTTP server running..");
      interval = setInterval(() => console.log(d.toUTCString()), argv.i);

      setTimeout(() => {
        clearInterval(interval);
        console.log("Date output stopped");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(d.toUTCString());
      }, argv.p);
    }
  })
  .listen(3000);
