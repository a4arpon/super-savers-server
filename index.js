const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')
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
})

async function run() {
  try {
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
  } finally {
  }
}
run()
// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
