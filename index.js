const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clustertest.wemsww6.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
})

async function run() {
  try {
    client.connect((err) => {
      if (err) {
        console.log(err)
        return
      }
    })
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
    // Server Code
    const toysCollection = client.db('toyDb').collection('toys')
    app.get('/', async (req, res) => {
      const result = await toysCollection.find().toArray()
      res.send(result)
    })
    // Add new toys to server
    app.post('/toy/add', async (req, res) => {
      const doc = req.body
      console.log(doc)
      const result = await toysCollection.insertOne(doc)
      res.send(result)
    })
    // update toys
    app.put('/toy/:id', async (req, res) => {
      const id = req.params.id
      const filteredToy = { _id: new ObjectId(id) }
      const updatedToy = req.body
      console.log(updatedToy)
      const options = { upsert: false }
      const updateDoc = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      }
      const result = await toysCollection.updateOne(
        filteredToy,
        updateDoc,
        options
      )
      res.send(result)
    })
    app.delete('/toy/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query)
      res.send(result)
    })
  } finally {
  }
}
run().catch(console.dir)
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
