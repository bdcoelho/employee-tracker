// Import required libraries
const path = require("path");
const util = require("util");
const fs = require("fs");
const express = require("express");

// Covert fs.readfile and fs.writefile into a promise
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// exoress.js setup
const app = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up the routes
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/notes", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "notes.html"));
});

// Retrieve db.json
app.get("/api/notes", function (req, res) {
  readFileAsync(__dirname + "/db/db.json", "utf8", function (error, data) {
    if (error) {
      return console.log(error);
    }
    res.json(JSON.parse(data));
  });
});
// Post a new note
app.post("/api/notes", function (req, res) {
  console.log(req.body);
  const addNote = req.body;
  readFileAsync(__dirname + "/db/db.json", "utf8", function (err, data) {
    if (err) {
      return console.log(err);
    }
    data = JSON.parse(data);
    data.push(addNote);
    data[data.length - 1].id = data.length - 1;
    writeFileAsync("./db/db.json", JSON.stringify(data));
    res.json(data);
  });
  // Delete notes by note ID
});
app.delete("/api/notes/:id", function (req, res) {
  const noteId = req.params.id;
  readFileAsync("./db/db.json", "utf8").then(function (data) {
    data = JSON.parse(data);
    data.splice(noteId, 1);
    for (var i = 0; i < data.length; i++) {
      data[i].id = i;
    }
    writeFileAsync("./db/db.json", JSON.stringify(data));
    res.json(data);
  });
});

// Listen on the the selected port
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});
