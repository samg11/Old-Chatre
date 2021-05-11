import express from "express";
import morgan from "morgan";

import groups from "./groups";
import chat from "./chat";

export const app = express();

// COMPRESSION
app.use(require('compression')())

// BODY PARSER
app.use(express.json())

// LOGGER
app.use(morgan(`:method :status :response-time ms :url`));

// static routes
app.use('/static', express.static('static'));

// EXPRESS MIDDLEWARE
app.use('/groups', groups);
app.use('/chat', chat);

// set ejs as template engine
app.set('view engine', 'ejs');

// index route
app.get("/", (req, res) => {
  res.render('pages/index');
});

// test route
app.get('/test', (req, res) => {
  res.status(200).send('api is working!');
});