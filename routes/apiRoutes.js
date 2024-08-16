let fs = require("fs"),
  dataBase = require("../db/db.json"),
  path = require("path"),
  { v4: uuidv4 } = require("uuid");

module.exports = (app) => {
  app.get("/api/notes", (req, res) => res.sendFile(path.join(__dirname, "../db/db.json")));

  app.post("/api/notes", (req, res) => {
    const newNote = {
      id: uuidv4(), // Generate a unique ID
      title: req.body.title,
      text: req.body.text,
      createdDate: new Date(),
      updatedDate: new Date(),
    };
    dataBase.push(newNote);

    fs.writeFile("db/db.json", JSON.stringify(dataBase, null, 4), (err) => {
      if (err) throw err;
      console.log("Saved!");
    });
    res.json(dataBase);
  });

  app.delete("/api/notes/:id", (req, res) => {
    const noteId = req.params.id;
    console.log(`Deleting note with id: ${noteId}`);

    // Filter out the note with the specified id
    dataBase = dataBase.filter(({ id }) => id !== noteId);

    // Write the updated database back to the file
    const dbPath = path.join(__dirname, "../db/db.json");
    fs.writeFile(dbPath, JSON.stringify(dataBase, null, 4), (err) => {
      if (err) {
        console.error("Error saving database:", err);
        return res.status(500).json({ error: "Failed to save database" });
      }
      console.log("Database updated!");
      res.json(dataBase);
    });
  });
};
