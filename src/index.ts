import express from "express";
import morgan from "morgan";
import path from "path";

import groups from "./groups";

const PORT = process.env.PORT || 8080;

const app = express();

// LOGGER
app.use(morgan(':method :status :response-time ms :url'));

// static routes
app.use('/bootstrap', express.static(path.join('node_modules', 'bootstrap', 'dist')));
app.use('/jquery', express.static(path.join('node_modules', 'jquery', 'dist')));
app.use('/public', express.static('public'));

// EXPRESS MIDDLEWARE
app.use('/groups', groups);

// set ejs as template engine
app.set('view engine', 'ejs');

// index route
app.get("/", (req, res) => {
  res.render('pages/index');
});

// runs web server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});