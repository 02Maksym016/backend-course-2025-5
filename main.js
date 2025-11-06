import { Command } from "commander";
import http from "http";
import fs from "fs/promises";

const program = new Command();

program
  .requiredOption("-h, --host <host>", "адреса сервера")
  .requiredOption("-p, --port <port>", "порт сервера")
  .requiredOption("-c, --cache <path>", "шлях до кешу");

program.parse(process.argv);
const options = program.opts();

// створити теку кешу, якщо не існує
await fs.mkdir(options.cache, { recursive: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Proxy server is running...");
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
