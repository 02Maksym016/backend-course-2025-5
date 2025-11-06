import path from "path";
import url from "url";

const cacheDir = options.cache;

const server = http.createServer(async (req, res) => {
  const code = url.parse(req.url).pathname.slice(1);
  const filePath = path.join(cacheDir, `${code}.jpg`);

  if (req.method === "GET") {
    try {
      const data = await fs.readFile(filePath);
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not Found");
    }
  } else if (req.method === "PUT") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    await fs.writeFile(filePath, Buffer.concat(chunks));
    res.writeHead(201);
    res.end("Created");
  } else if (req.method === "DELETE") {
    try {
      await fs.unlink(filePath);
      res.writeHead(200);
      res.end("Deleted");
    } catch {
      res.writeHead(404);
      res.end("Not Found");
    }
  } else {
    res.writeHead(405);
    res.end("Method Not Allowed");
  }
});
