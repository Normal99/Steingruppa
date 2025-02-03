const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB connection details
const uri = "mongodb+srv://itlinjatelemark27:Gcp8J8CjPYhTRocb@cluster0.jtvq3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function insertData() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    // Access the database and collection
    const db = client.db("Stein");
    const collection = db.collection("Steiner");

    // Read the JSON file
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

    // Insert data into MongoDB
    const result = await collection.insertMany(data);
    console.log(`Inserted ${result.insertedCount} documents into the collection.`);
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    // Close the connection
    await client.close();
    console.log("Connection closed");
  }
}

insertData();
