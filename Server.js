const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Beispielroute
app.get("/", (req, res) => {
  res.send("Atlas-Server läuft!");
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
