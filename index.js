const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const allWishlistCollection = client.db("dream-prime-estates").collection("AllWishlist");
    const usersCollection = client.db("dream-prime-estates").collection("AllUsers");
    const boughtCollection = client.db("dream-prime-estates").collection("BoughtProperty");

    // User related Api 
    app.post('/AllUsers', async (res, req) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    app.get('/AllUsers', async (res, req) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.delete('/AllUsers/email', async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.deleteOne(email);
      res.send(result);
    })


    // Properties related Api 
    app.get('/AllProperties', async (req, res) => {
      const result = await allPropertiesCollection.find().toArray();
      res.send(result)
    })

    app.get('/AllProperties/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await allPropertiesCollection.findOne(query);
      res.send(result)
    })

    // Advertisement related Api 
    app.get('/Advertisement', async (req, res) => {
      const result = await advertisementCollection.find().toArray();
      res.send(result);
    })

    // Wishlist related Api
    app.post('/AllWishlist', async (req, res) => {
      const wishtlistItem = req.body;
      const result = await allWishlistCollection.insertOne(wishtlistItem);
      res.send(result);
    })

    app.get('/AllWishlist/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allWishlistCollection.findOne(query);
      res.send(result);
    })

    app.get('/AllWishlist', async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      const result = await allWishlistCollection.find(query).toArray();
      res.send(result)
    })

    app.delete('/AllWishlist/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await allWishlistCollection.deleteOne(query);
      res.send(result);
    })

    // Property Bought
    app.post('/BoughtProperty', async (req, res) => {
      const boughtitems = req.body;
      const result = await boughtCollection.insertOne(boughtitems);
      res.send(result)
    })

    app.get('/BoughtProperty/:id', async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      const result = await boughtCollection.find(query).toArray();
      res.send(result);
    })

    // Review related Api 
    app.get('/AllREviews', async (req, res) => {
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



app.get('/', (req, res) => {
  res.send('Dream Prime Estate Server Is Running')
})

app.listen(port, (req, res) => {
  console.log(`Dream Prime Estate is Running on Port ${port}`)
})
