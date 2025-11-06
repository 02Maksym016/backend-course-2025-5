import { Command } from "commander";
import http from "http";
import fs from "fs/promises";
import path from "path";
import url from "url";
import superagent from "superagent";

// === Частина 1: командний рядок і запуск сервера ===
const program = new Command();

program
  .requiredOption("-h, --host <host>", "адреса сервера")
  .requiredOption("-p, --port <port>", "порт сервера")
  .requiredOption("-c, --cache <path>", "шлях до директорії кешу");

program.parse(process.argv);
const options = program.opts();

// створюємо теку для кешу, якщо її немає
await fs.mkdir(options.cache, { recursive: true });

// === Частина 2 + 3: логіка проксі-сервера ===
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  const code = parsedUrl.pathname.slice(1); // наприклад, /200 → "200"
  const filePath = path.join(options.cache, `${code}.jpg`);

  if (!code) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Proxy server is running...");
    return;
  }

  try {
    if (req.method === "GET") {
      // спочатку перевіряємо, чи є файл у кеші
      try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.end(data);
      } catch {
        // якщо немає — отримуємо з http.cat і кешуємо
        try {
          const response = await superagent.get(`https://http.cat/${code}`);
          const imageBuffer = response.body;
          await fs.writeFile(filePath, imageBuffer);
          res.writeHead(200, { "Content-Type": "image/jpeg" });
          res.end(imageBuffer);
        } catch {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        }
      }
    } else if (req.method === "PUT") {
      // збереження файлу вручну
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      await fs.writeFile(filePath, Buffer.concat(chunks));
      res.writeHead(201, { "Content-Type": "text/plain" });
      res.end("Created");
    } else if (req.method === "DELETE") {
      // видалення файлу
      try {
        await fs.unlink(filePath);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Deleted");
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    } else {
      // інші методи
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
    }
  } catch (err) {
    console.error("Error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});

// запуск сервера
server.listen(options.port, options.host, () => {
  console.log(`✅ Server running at http://${options.host}:${options.port}/`);
});
