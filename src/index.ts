import express from "express";

const PORT = process.env.PORT || 8080;

const app = express();

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});