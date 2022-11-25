const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();
const cors = require('cors')
const jwt = require('jsonwebtoken')


app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello Laptop')
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const e = require('express');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.tgkwl01.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async()=>{
 try{
    const productsCollection = client.db('laptopBazzar').collection('products')
    const divisionCollection = client.db('laptopBazzar').collection('division')
    const usersCollection = client.db('laptopBazzar').collection('users')
    const bookmarksCollection = client.db('laptopBazzar').collection('users')

    app.get('/products',async(req,res)=>{
        const query ={}
        const result = await productsCollection.find(query).sort({_id:-1}).limit(8).toArray();
        res.send(result)
    })

    app.post('/products',async(req,res)=>{
        const product = req.body;
        const result = await productsCollection.insertOne(product)
        res.send(result)
    })

   

    app.get('/products/:id',async(req,res)=>{
        const brand = req.params.id;
        const query = {category: brand}
        const result = await productsCollection.find(query).toArray();
        res.send(result)
    })


    app.post('/users',async(req,res)=>{
        const user = req.body;
        const email = user.email;
        const query = {email:email}
        const oldUser =await usersCollection.findOne(query)
       if(email===oldUser?.email){
        return ;
       }
        const result = await usersCollection.insertOne(user)
        res.send(result)
    })

    app.put('/users',async(req,res)=>{
        const role = req.body.role;
        const email = req.query.email;
        const filter = {email: email}
        console.log(role)
        const options = {upsert: true};
        const updateDoc={
            $set:{
                role:role
            }
        }
        const result = await usersCollection.updateOne(filter,updateDoc,options)
        res.send(result)
    }) 

    app.get('/users',async(req,res)=>{
        const email = req.query.email
        const query = {email: email}
        const result = await usersCollection.findOne(query)
        res.send(result)
    })

    app.post('/bookmarks',async(req,res)=>{
        const bookmark = req.body;
        const result = await bookmarksCollection.insertOne(bookmark);
        res.send(result)
    })

    app.get('/bookmarks',async(req,res)=>{
        const email = req.query.email;
        const query = {email:email}
        const result = await bookmarksCollection.find(query).toArray();
        res.send(result)
    })

    app.get('/division',async(req,res)=>{
        const result = await divisionCollection.find({}).toArray()
        res.send(result)
    })
 }
 finally{}
}

run().catch((err)=>{
    console.log(err)
})



app.listen(port,()=>{
    console.log('Server running on port:',port)
})