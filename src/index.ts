import express from "express";
import morgan from "morgan";

import groups from "./groups";
import chat from "./chat";
import secureChat from './secure-chat';

const PORT = process.env.PORT || 8080;

const app = express();

// BODY PARSER
app.use(express.json())

// LOGGER
app.use(morgan(`:method :status :response-time ms :url`));

// static routes
app.use('/public', express.static('public'));

// EXPRESS MIDDLEWARE
app.use('/groups', groups);
app.use('/chat', chat);
app.use('/secure-chat', secureChat);

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