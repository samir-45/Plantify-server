const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
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

// Create a data base to store new plants data
// const newPlantsCollection = client.db('PlantsDB').collection('newPlants');

// Create a data base to store All plants data
const PlantsCollection = client.db('PlantsDB').collection('plants');

// Create a data base to store My own plants data
// const myPlantsCollection = client.db('PlantsDB').collection('myPlants');

// ----------------------------------------------------------------------

// Now make a post for get plant input data and curd operation with client side data
// app.post('/newPlants', async(req, res) => {
//   const getPlants = req.body;
//   const result = await newPlantsCollection.insertOne(getPlants);
//   res.send(result)
// })

// Now make a post for get plant input data and curd operation with client side data
app.post('/plants', async(req, res) => {
  const getPlants = req.body;
  const result = await PlantsCollection.insertOne(getPlants);
  res.send(result)
})

// Now make a post for get plant input data and curd operation with client side data
// app.post('/myPlants', async(req, res) => {
//   const getPlants = req.body;
//   const result = await myPlantsCollection.insertOne(getPlants);
//   res.send(result)
// })

// ------------Make api to get plant data--------------

// Make a get operation to get new Plants all data db to client site by making all data api

// app.get('/newPlants', async(req, res) => {
//   const result = await newPlantsCollection.find().toArray();
//   res.send(result)
// })

// Make a get operation to get new Plants all data db to client site by making all data api

app.get('/plants', async(req, res) => {
  const result = await PlantsCollection.find().toArray();
  res.send(result)
})

// Make a get operation to get new Plants all data db to client site by making all data api

// app.get('/myPlants', async(req, res) => {
//   const result = await myPlantsCollection.find().toArray();
//   res.send(result)
// })




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