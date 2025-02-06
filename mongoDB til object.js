
const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB connection details
const uri = "mongodb+srv://itlinjatelemark27:Gcp8J8CjPYhTRocb@cluster0.jtvq3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let allesteiner;

async function getObject() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Stein");
    const collection = db.collection("Steiner");

    allesteiner = await collection.find({}).toArray();
    
    //console.log('Objektet:',allesteiner)
    return allesteiner;
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    // Close the connection
    await client.close();
    console.log("Connection closed");
  }
}

getObject();

module.exports = {allesteiner}