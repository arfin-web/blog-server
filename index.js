const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cqu6n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connected');
        const database = client.db("blogs");
        const blogCollection = database.collection("blog");
        const users = database.collection("users");
        const myblogs = database.collection("myblogs");

        // create a document to insert
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            const result = await blogCollection.insertOne(blog);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // create a document to insert
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // get all blogs
        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find({})
            const result = await cursor.toArray();
            res.json(result)
        })

        // get admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await users.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // get single blog
        app.get('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await blogCollection.findOne(query);
            res.json(result)
        })

        // get all my blogs
        app.get('/blogs', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await myblogs.find(query).toArray()
            res.json(result)
        })

        // delete a document
        app.delete('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await blogCollection.deleteOne(query);
            res.json(result);
        })

        // add role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: "admin" } }
            const result = await users.updateOne(filter, updateDoc);
            res.json(result);
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`this app listening at http://localhost:${port}`)
})