// create a simple server

const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const ServerBlockNoteEditor = require("@blocknote/server-util");

const editor = ServerBlockNoteEditor.ServerBlockNoteEditor.create();

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://dinesh:dinesh@cluster0.bbtf8hk.mongodb.net/";
const client = new mongodb.MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// check the connection
client.connect((err) => {
  if (err) {
    console.log("Connection error: ", err);
    return;
  }
  console.log("Connected to MongoDB");
});

app.get("/", (req, res) => {
  res.send("Hello Dex!");
});

app.post("/api/submit", async (req, res) => {
  try {
    const data = req.body;
    const db = client.db("blogs_database");
    const collection = db.collection("blogs");

    // Using await instead of callbacks
    const result = await collection.insertOne(data);

    // Check if the insertion was successful
    if (result.acknowledged) {
      res.status(200).json({
        success: true,
        message: "Data added to database",
        insertedId: result.insertedId,
      });
    } else {
      throw new Error("Insert operation was not acknowledged");
    }
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({
      success: false,
      message: "Error adding data to database",
      error: error.message,
    });
  }
});

app.get("/api/blogs", async (req, res) => {
  try {
    const db = client.db("blogs_database");
    const collection = db.collection("blogs");

    // Using modern async/await syntax
    const blogs = await collection.find({}).toArray();
    for (let i = 0; i < blogs.length; i++) {
      blogs[i]["content"] = await editor.blocksToFullHTML(blogs[i]["content"]);
    }
    // Send response with metadata
    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs from database",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
