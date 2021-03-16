import express from "express";

const groups = express();

// List Groups
groups.get("/", (req, res) => {
  res.send('List of groups user belongs to');
});

groups.get("/create", (req, res) => {
  res.send('Create Group');
});

export default groups;
