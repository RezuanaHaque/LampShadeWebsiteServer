const express = require('express')
const { MongoClient } = require('mongodb');
const app = express()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const { query } = require('express');
const port = process.env.PORT || 5000
require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p1pde.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db("lamp-shade");
        const productsCollection = database.collection("products");
        const productsCollectionWithUserInfo = database.collection("productsWithUserInfo");
        const reviewCollection = database.collection("reviews");
        const usersCollection = database.collection("users");
        // to get all the product 
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = productsCollection.find(query);
            const product = await cursor.toArray();
            res.send(product)
        })
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollectionWithUserInfo.insertOne(product)
            // console.log(result);
            res.json(result)
        })
        app.post('/addproducts', async (req, res) => {
            const product = req.body;
            // console.log(product)
            const result = await productsCollection.insertOne(product)
            console.log(result);
            res.json(result)
        })
        app.delete('/productswithuserinfo/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: (id.toString()) }
            const result = await productsCollectionWithUserInfo.deleteOne(query);
            res.json(result)
        })
        app.get('/productswithuserinfo', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = productsCollectionWithUserInfo.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })
        app.get('/productswithusers', async (req, res) => {
            const cursor = productsCollectionWithUserInfo.find({});
            const products = await cursor.toArray();
            res.send(products)
        })

        //status update
        app.put('/productswithusers', async (req, res) => {
            const status = req.body;
            filter = { email: status.email, _id: status._id }
            const updateDoc = { $set: { status: 'shipped' } }
            const result = await productsCollectionWithUserInfo.updateOne(filter, updateDoc)
            res.json(result)
        })

        app.delete('/productswithusers/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: (id.toString()) }
            const result = await productsCollectionWithUserInfo.deleteOne(query);
            res.json(result)
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            // console.log(review);
            const result = await reviewCollection.insertOne(review)
            // console.log(product);
            res.json(result)
        })
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user)
            // console.log(result);
            res.json(result)
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            let isAdmin = false
            // console.log(result);
            if (result?.role === 'admin') {
                isAdmin = true
            }
            // console.log(isAdmin);
            res.json({ admin: isAdmin })
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.json(result)
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})