const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mgueq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.mgueq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const database = client.db("CrowdDb");
    const campaignCollection = database.collection("campain");

    //cration api for adding campian
    app.post("/Addcampaigns", async (req, res) => {
      const {
        title,
        type,
        description,
        minDonation,
        deadline,
        userEmail,
        userName,
        thumbnail,
      } = req.body;
      
      const newCampaign = {
        title,
        type,
        description,
        minDonation: parseFloat(minDonation),
        deadline: new Date(deadline),
        userEmail,
        userName,
        thumbnail,
        createdAt: new Date(),
      };
      console.log(newCampaign);
      

      try {
        const result = await campaignCollection.insertOne(newCampaign);
        res.send(result);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to add campaign", error: error.message });
      }
    });

    // Getiing  All Campaigns
    app.get("/campaigns", async (req, res) => {
      try {
        const cursor = campaignCollection.find();
        const result = await cursor.toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    });
    app.get("/campaigns/:id", async (req, res) => {
      try {
        const id=req.params.id;
        console.log(id);
        
        const query = { _id: new ObjectId(id) };
        console.log(query);
        
        const result = await campaignCollection.findOne(query);
        console.log(result);
        res.send(result);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Crowdcube API!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
