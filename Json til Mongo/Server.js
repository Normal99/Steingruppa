const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

// MongoDB connection details
const uri = "mongodb+srv://itlinjatelemark27:Gcp8J8CjPYhTRocb@cluster0.jtvq3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

let db;
client.connect().then(() => {
  db = client.db("stein").collection("steiner");
  console.log("Connected to MongoDB");
});

// API endpoint to fetch data
app.get('/api/stones', async (req, res) => {
  try {
    const data = await db.find({}).toArray();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send({ message: "Error fetching data", error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
