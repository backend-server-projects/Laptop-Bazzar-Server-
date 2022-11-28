const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const cors = require("cors");
const jwt = require('jsonwebtoken')
const axios = require("axios");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Laptop");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.tgkwl01.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {


    const verifyJWT = async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).send({ message: "Unauthorize access" });
        }
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) =>{
          if (err) {
            return res.status(403).send({ message: "forbidden access" });
          }
          req.decoded = decoded;
          next();
        });
      };


  try {
    const productsCollection = client.db("laptopBazzar").collection("products");
    const divisionCollection = client.db("laptopBazzar").collection("division");
    const usersCollection = client.db("laptopBazzar").collection("users");
    const bookmarksCollection = client
      .db("laptopBazzar")
      .collection("bookmarks");
    const adsCollection = client.db("laptopBazzar").collection("ads");
    const ordersCollection = client.db("laptopBazzar").collection("orders");

    app.get("/allproducts", async (req, res) => {
      const query = {};
      const result = await productsCollection
        .find(query)
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    app.get("/myproducts", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      
      if(email !== decodedEmail){
       return res.status(401).send({message:'unauthorized access'})
      }
      const query = { email: email };
      const result = await productsCollection.find(query).sort({_id:-1 }).toArray();
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const result = await productsCollection
        .find(query)
        .sort({ _id: -1 })
        .limit(8)
        .toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const brand = req.params.id;
      const query = { category: brand };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/products", async (req, res) => {
      const id = req.query.id;
      const sold = req.query.sold;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateProduct = {
        $set: {
          sold: sold,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        updateProduct,
        option
      );
      res.send(result);
    });

   

    app.get("/payproducts/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.send(result);
    });

    app.put("/update-sold/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatePay = {
        $set: {
          sold: "sold",
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        updatePay,
        options
      );
      res.send(result);
    });

    app.patch("/update-sold/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateOrder = {
        $set: {
          sold: "paid",
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateOrder,
        option
      );
      res.send(result);
    });

    app.post("/advertise", async (req, res) => {
      const ads = req.body;
      const result = await adsCollection.insertOne(ads);
      res.send(result);
    });

    app.delete("/advertise", async (req, res) => {
      const id = req.query.id;
      const query = { id: id };
      const result = await adsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/advertise", async (req, res) => {
      const query = {};
      const result = await adsCollection
        .find(query)
        .sort({ _id: -1 })
        .limit(4)
        .toArray();
      res.send(result);
    });

    app.put("/advertise", async (req, res) => {
      const ads = req.body.ads;
      const id = req.query.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateAds = {
        $set: {
          ads: ads,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        updateAds,
        option
      );
      res.send(result);
    });

    app.post("/myOrders", async (req, res) => {
      const product = req.body;
      const result = await ordersCollection.insertOne(product);
      res.send(result);
    });

    app.get("/myOrders",verifyJWT, async (req, res) => {
      const email = req.query.email;
      const query = {email:email}
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/order",verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email
      if(email!==decodedEmail){
        return res.status(401).send({message:'unauthorized access'})
      }
      const query = { email: email };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const query = { email: email };
      const oldUser = await usersCollection.findOne(query);
      if (email === oldUser?.email) {
        return;
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.put("/users", async (req, res) => {
      const role = req.body.role;
      const email = req.query.email;
      const filter = { email: email };
      console.log(role);
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: role,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/dbusers", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.get("/sellers", async (req, res) => {
      const role = req.query.role;
      const query = { role: role };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/sellers", async (req, res) => {
      const email = req.query.email;
      const verify = req.body.verify;
      console.log(email, verify);
      const filter = { email: email };
      const options = { upsert: true };
      const updateSeller = {
        $set: {
          verify: verify,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateSeller,
        options
      );
      res.send(result);
    });

    app.get("/buyers", async (req, res) => {
      const query = { role: "buyer" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      return res.status(403).send({ accessToken: "" });
    });

    app.post("/bookmarks", async (req, res) => {
      const bookmark = req.body;
      const result = await bookmarksCollection.insertOne(bookmark);
      res.send(result);
    });

    app.get("/bookmarks",verifyJWT, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await bookmarksCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/division", async (req, res) => {
      const result = await divisionCollection.find({}).toArray();
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => {
  console.log(err);
});

app.listen(port, () => {
  console.log("Server running on port:", port);
});
