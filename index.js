const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require('stripe')(process.env.PAYMENT_ACCESS)
const port = process.env.PORT || 5000;

//Middle Ware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASS}@cluster0.trhzw6v.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allPropertiesCollection = client
      .db("dream-prime-estates")
      .collection("AllProperties");
    const advertisementCollection = client
      .db("dream-prime-estates")
      .collection("Advertisement");
    const allReviewsCollection = client
      .db("dream-prime-estates")
      .collection("AllReviews");
    const allWishlistCollection = client
      .db("dream-prime-estates")
      .collection("AllWishlist");
    const usersCollection = client
      .db("dream-prime-estates")
      .collection("AllUsers");
    const boughtCollection = client
      .db("dream-prime-estates")
      .collection("BoughtProperty");
    const offeredCollection = client
      .db("dream-prime-estates")
      .collection("offeredItem");

    // JWT Related Api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // MiddleWares
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    // User related Api
    app.get("/AllUsers", verifyToken, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get("/AllUsers/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    app.post("/AllUsers", async (req, res) => {
      const users = req.body;
      const query = { email: users.email };
      const exitingUser = await usersCollection.findOne(query);
      if (exitingUser) {
        return;
      }
      const result = await usersCollection.insertOne(users);
      res.send(result);
    });

    app.patch("/AllUsers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: req.body.role,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/AllUsers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Properties related Api
    app.get("/AllProperties", async (req, res) => {
      const filter = req.query;
      const query = {
        $or: [
          { property_title: { $regex: filter.search, $options: "i" } },
          { property_location: { $regex: filter.search, $options: "i" } },
        ],
      };
      const result = await allPropertiesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/AllProperties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allPropertiesCollection.findOne(query);
      res.send(result);
    });

    app.get("/MyAddedProperties",verifyToken, async (req, res) => {
      const user_mail = req.query.email;
      const query = { agent_email: user_mail};
      const result = await allPropertiesCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/AllProperties", async (req, res) => {
      const query = req.body;
      const result = await allPropertiesCollection.insertOne(query);
      res.send(result);
    });

    app.patch("/AllProperties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          property_status: req.body.property_status,
        },
      };
      const result = await allPropertiesCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/AllProperties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allPropertiesCollection.deleteOne(query);
      res.send(result);
    });

    // Advertisement related Api
    app.get("/Advertisement", async (req, res) => {
      const result = await advertisementCollection.find().toArray();
      res.send(result);
    });

    // Wishlist related Api
    app.post("/AllWishlist", verifyToken, async (req, res) => {
      const wishtlistItem = req.body;
      const result = await allWishlistCollection.insertOne(wishtlistItem);
      res.send(result);
    });

    app.get("/AllWishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allWishlistCollection.findOne(query);
      res.send(result);
    });

    app.get("/AllWishlist", async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      const result = await allWishlistCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/AllWishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allWishlistCollection.deleteOne(query);
      res.send(result);
    });

    // OfferedProperty
    app.post("/offeredItem",async(req,res)=>{
      const offerItem = req.body;
      const result= await offeredCollection.insertOne(offerItem);
      res.send(result);
    })

    app.get("/offeredItem", async(req,res)=>{
      const email = req.query.email;
      const query = {user_email:email};
      const result = await offeredCollection.find(query).toArray();
      res.send(result);
    })

    app.get("/offeredProperties",async(req,res)=>{
      const email = req.query.email;
      const query = {agent_email:email};
      const result = await offeredCollection.find(query).toArray();
      res.send(result);
    })

    app.delete("/offeredItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await offeredCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/offeredItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: req.body.status,
        },
      };
      const result = await offeredCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Property Bought
    app.post("/BoughtProperty", async (req, res) => {
      const boughtItems = req.body;
      const result = await boughtCollection.insertOne(boughtItems);
      res.send(result);
    });

    app.get("/BoughtProperty", async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      const result = await boughtCollection.find(query).toArray();
      res.send(result);
    });

    // Review related Api
    app.get("/AllREviews", async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      const result = await allReviewsCollection.find(query).toArray();
      res.send(result);
    });

    // Payment Related 
    app.post('payment',async(req,res)=>{
      const {offer_price} =req.body;
      const amount = parseInt(price *100);
      const payment = await stripe.paymentIntents.create({
        amount:amount,
        currency:'usd',
        payment_method_types:[
          "card"
        ]
      })
      res.send({
        clientSecret :payment.client_secret
      })
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Dream Prime Estate Server Is Running");
});

app.listen(port, (req, res) => {
  console.log(`Dream Prime Estate is Running on Port ${port}`);
});
