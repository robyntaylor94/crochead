const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "/public")));

// Fallback route (optional but nice)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🐊 Croc ER Meter running at http://localhost:${PORT}`);
});
