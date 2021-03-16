import express from "express";
import path from "path";

const PORT = process.env.PORT || 8080;

const app = express();

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});