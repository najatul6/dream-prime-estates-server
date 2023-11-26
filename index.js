const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;

//Middle Ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASS}@cluster0.trhzw6v.mongodb.net/?retryWrites=true&w=majority`;

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

    const allPropertiesCollection = client.db("dream-prime-estates").collection("AllProperties");
    const advertisementCollection = client.db("dream-prime-estates").collection("Advertisement");
    const allReviewsCollection = client.db("dream-prime-estates").collection("AllReviews");
    const usersCollection = client.db("dream-prime-estates").collection("AllUsers");

    // Properties related Api 
    app.get('/AllProperties',async(req,res)=>{
        const result = await allPropertiesCollection.find().toArray();
        res.send(result)
    })

    // Advertisement related Api 
    app.get('/Advertisement',async(req,res)=>{
        const result = await advertisementCollection.find().toArray();
        res.send(result);
    })

    // Review related Api 
    app.get('/AllREviews', async(req,res)=>{
        const result = await allReviewsCollection.find().toArray();
        res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Dream Prime Estate Server Is Running')
})

app.listen(port, (req,res)=>{
    console.log(`Dream Prime Estate is Running on Port ${port}`)
})
