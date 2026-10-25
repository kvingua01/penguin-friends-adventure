const express = require("express");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 8080;

for (const asset of ["game.js", "world.js", "style.css"]) {
  app.get("/" + asset, (_req, res) =>
    res.sendFile(path.join(__dirname, asset)),
  );
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Penguin Friends Adventure listening on port ${port}`);
});
