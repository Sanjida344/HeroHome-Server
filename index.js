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

let propertyCollection;
let ratingsCollection;

// =======================
// DB helpers
// =======================
function ensureDbCollections(res) {
  if (!propertyCollection || !ratingsCollection) {
    res.status(500).json({
      message: "Database not initialized",
      code: "DB_NOT_INITIALIZED",
    });
    return false;
  }
  return true;
}

// =======================
// Main Run Function
// =======================
async function run() {
  try {
    // Connect to MongoDB
    await client.connect();

    // Test ping
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB Connected Successfully!");

    const homeNestDB = client.db("homeNest_database");
    propertyCollection = homeNestDB.collection("properties");
    ratingsCollection = homeNestDB.collection("ratings");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
  }
}

run().catch(console.dir);

// =======================
// Property APIs
// =======================
app.post("/property", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const newProperty = req.body;
    const result = await propertyCollection.insertOne(newProperty);
    res.send(result);
  } catch (error) {
    console.error("Error in POST /property:", error);
    res.status(500).json({ message: "Failed to create property" });
  }
});

app.post("/properties", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const newProperty = req.body;
    const result = await propertyCollection.insertOne(newProperty);
    res.send(result);
  } catch (error) {
    console.error("Error in POST /properties:", error);
    res.status(500).json({ message: "Failed to create property" });
  }
});

app.get("/all-properties", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const result = await propertyCollection
      .find()
      .sort({ postedDate: -1 })
      .toArray();
    res.send(result);
  } catch (error) {
    console.error("Error in GET /all-properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

app.get("/latest-properties", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const result = await propertyCollection
      .find()
      .sort({ postedDate: -1 })
      .limit(6)
      .toArray();
    res.send(result);
  } catch (error) {
    console.error("Error in GET /latest-properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

app.get("/property/:id", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const id = req.params.id;
    const result = await propertyCollection.findOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (error) {
    console.error("Error in GET /property/:id:", error);
    res.status(500).json({ message: "Failed to fetch property" });
  }
});

app.get("/property", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const userEmail = req.query.email;
    const result = await propertyCollection
      .find({ owner_email: userEmail })
      .toArray();
    res.send(result);
  } catch (error) {
    console.error("Error in GET /property:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

app.delete("/property/:id", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const id = req.params.id;
    const result = await propertyCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (error) {
    console.error("Error in DELETE /property/:id:", error);
    res.status(500).json({ message: "Failed to delete property" });
  }
});

app.patch("/property/:id", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const id = req.params.id;
    const updateData = req.body;

    const result = await propertyCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.send(result);
  } catch (error) {
    console.error("Error in PATCH /property/:id:", error);
    res.status(500).json({ message: "Failed to update property" });
  }
});

// =======================
// Ratings APIs
// =======================
app.post("/ratings", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const ratingsBody = req.body;
    const result = await ratingsCollection.insertOne(ratingsBody);
    res.send(result);
  } catch (error) {
    console.error("Error in POST /ratings:", error);
    res.status(500).json({ message: "Failed to create rating" });
  }
});

app.get("/ratings", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const userEmail = req.query.email;
    const result = await ratingsCollection
      .find({ reviewerEmail: userEmail })
      .toArray();
    res.send(result);
  } catch (error) {
    console.error("Error in GET /ratings:", error);
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
});

app.delete("/ratings/:id", async (req, res) => {
  if (!ensureDbCollections(res)) return;
  try {
    const id = req.params.id;
    const result = await ratingsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (error) {
    console.error("Error in DELETE /ratings/:id:", error);
    res.status(500).json({ message: "Failed to delete rating" });
  }
});

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
