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
  db = client.db("Stein").collection("Steiner");
  console.log("Connected to MongoDB");
});

// API endpoint to fetch data
app.get('/api/stones', async (req, res) => {
  try {
      const { søkefelt, filterKasse, filterSteingruppe, filterId, filterSted } = req.query;
      const query = {};

      if (søkefelt) {
          query.$or = [
              { kasse: { $regex: søkefelt, $options: 'i' } },
              { steingruppe: { $regex: søkefelt, $options: 'i' } },
              { id: { $regex: søkefelt, $options: 'i' } },
              { sted: { $regex: søkefelt, $options: 'i' } }
          ];
      }

      if (filterKasse) query.kasse = { $regex: filterKasse, $options: 'i' };
      if (filterSteingruppe) query.steingruppe = { $regex: filterSteingruppe, $options: 'i' };
      if (filterId) query.id = { $regex: filterId, $options: 'i' };
      if (filterSted) query.sted = { $regex: filterSted, $options: 'i' };

      const data = await db.find(query).toArray();
      res.status(200).json(data);
  } catch (error) {
      res.status(500).send({ message: "Error fetching data", error });
  }
});

// API endpoint to add a new stone
app.post('/api/stones', async (req, res) => {
  try {
      const newStone = req.body;
      const result = await db.insertOne(newStone);
      res.status(201).json(result);
  } catch (error) {
      res.status(500).send({ message: "Error adding stone", error });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
