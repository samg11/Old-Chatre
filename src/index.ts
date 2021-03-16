import express from "express";
import path from "path";

const PORT = process.env.PORT || 8080;

const app = express();
app.use('/bootstrap', express.static(path.join('node_modules', 'bootstrap', 'dist')))
app.use('/jquery', express.static(path.join('node_modules', 'jquery', 'dist')))


app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render('pages/index');
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});