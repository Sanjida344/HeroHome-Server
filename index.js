const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// =======================
// Middleware
// =======================
app.use(cors());
app.use(express.json());

// =======================
// MongoDB URI
// =======================
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.9nhwetk.mongodb.net/?appName=Cluster0`;

// Create Mongo Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// =======================
// Main Run Function
// =======================
async function run() {
  try {
    // Connect to MongoDB
    await client.connect();

    // Test ping
    // await client.db("admin").command({ ping: 1 });
    // console.log("✅ MongoDB Connected Successfully!");

    const homeNestDB = client.db("homeNest_database");
    const propertyCollection = homeNestDB.collection("properties");
    const ratingsCollection = homeNestDB.collection("ratings");

    // =======================
    // Property APIs
    // =======================
    app.post("/property", async (req, res) => {
      const newProperty = req.body;
      const result = await propertyCollection.insertOne(newProperty);
      res.send(result);
    });

    app.post("/properties", async (req, res) => {
      const newProperty = req.body;
      const result = await propertyCollection.insertOne(newProperty);
      res.send(result);
    });

    app.get("/all-properties", async (req, res) => {
      const result = await propertyCollection
        .find()
        .sort({ postedDate: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/latest-properties", async (req, res) => {
      const result = await propertyCollection
        .find()
        .sort({ postedDate: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/property/:id", async (req, res) => {
      const id = req.params.id;
      const result = await propertyCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/property", async (req, res) => {
      const userEmail = req.query.email;
      const result = await propertyCollection
        .find({ owner_email: userEmail })
        .toArray();
      res.send(result);
    });

    app.delete("/property/:id", async (req, res) => {
      const id = req.params.id;
      const result = await propertyCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.patch("/property/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;

      const result = await propertyCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      res.send(result);
    });

    // =======================
    // Ratings APIs
    // =======================
    app.post("/ratings", async (req, res) => {
      const ratingsBody = req.body;
      const result = await ratingsCollection.insertOne(ratingsBody);
      res.send(result);
    });

    app.get("/ratings", async (req, res) => {
      const userEmail = req.query.email;
      const result = await ratingsCollection
        .find({ reviewerEmail: userEmail })
        .toArray();
      res.send(result);
    });

    app.delete("/ratings/:id", async (req, res) => {
      const id = req.params.id;
      const result = await ratingsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
  }
}

run().catch(console.dir);

// =======================
// Root API
// =======================
app.get("/", (req, res) => {
  res.send("api working fine!");
});

// =======================
// Start Server (Local)
// =======================
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server running on port: ${port}`);
  });
}

module.exports = app;
