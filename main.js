import superagent from "superagent";

if (req.method === "GET") {
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.end(data);
  } catch {
    try {
      const response = await superagent.get(`https://http.cat/${code}`);
      await fs.writeFile(filePath, response.body);
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(response.body);
    } catch {
      res.writeHead(404);
      res.end("Not Found");
    }
  }
}
