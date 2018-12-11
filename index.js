
/* jshint esversion:6*/

const express = require('express');
const http = require('http');

const app = express();
const server = http.Server(app);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});