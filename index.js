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
    // Server Code
    const toysCollection = client.db('toyDb').collection('toys')
    app.get('/', async (req, res) => {
      const currentPage = parseInt(req.query.page) || 0
      const toyLimit = parseInt(req.query.limit) || 20
      const skipToy = currentPage * toyLimit
      const result = toysCollection
        .find()
        .skip(skipToy)
        .limit(toyLimit)
        .toArray()
      res.send(result)
    })
    app.get('/totalToys', async (req, res) => {
      const result = await toysCollection.estimatedDocumentCount()
      res.send(result)
    })
    // Filtered By Category
    app.get('/type/:type', async (req, res) => {
      const type = req.params.type
      let query = { category: type }
      if (type === 'recommended') {
        query = { rating: { $gt: 4.5 } }
      }
      const result = await toysCollection.find(query).toArray()
      res.send(result)
    })
    // Filter by id single toy
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query)
      res.send(result)
    })
    // Get data for single user
    app.post('/myToys', async (req, res) => {
      const email = req.body
      let query = { seller_email: email }
      const result = await toysCollection.find(query).toArray()
      res.send(result)
    })
    // Add new toys to server
    app.post('/toy/add', async (req, res) => {
      const doc = req.body
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
    // Delete toy
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
