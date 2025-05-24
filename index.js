const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// ID : plant_DB  Pass : XlbyYFppZBI19rVP

// Middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d2h2whv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // ------------------------------------------My operation site-----------------------------------

    // Create a data base to store All plants data
    const PlantsCollection = client.db('PlantsDB').collection('plants');

    // ----------------------------------------------------------------------

    // Now make a post for input plant data and curd operation with client side data
    app.post('/plants', async (req, res) => {
      const getPlants = req.body;
      const result = await PlantsCollection.insertOne(getPlants);
      res.send(result)
    })


    // Make a get operation to get new Plants all data db to client site by making all data api

    app.get('/plants', async (req, res) => {
      const result = await PlantsCollection.find().toArray();
      res.send(result)
    })

    // Doing a operation to get a single coffee details by using findone
    app.get('/plants/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await PlantsCollection.findOne(query); 
      res.send(result); 
    })


        // Do a api operation for update data
    app.put('/plants/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedPlant = req.body;
      const updatedDocument = {
        $set: updatedPlant
      };

      const result = await PlantsCollection.updateOne(filter, updatedDocument, options);
      res.send(result);

    })


        // For delete user data
    app.delete('/plants/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await PlantsCollection.deleteOne(query);
      res.send(result)
    })



    // ------------------------------------------operation END---------------------------------------

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


// ----------------------------------------------------------------------------------



// Started...
app.get('/', (req, res) => {
  res.send('Plant is getting bigger')
});

// For listen port
app.listen(port, () => {
  console.log(`Plant server is running on port ${port}`)
}); 