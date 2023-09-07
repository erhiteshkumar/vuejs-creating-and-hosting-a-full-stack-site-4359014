import express from 'express';
import { MongoClient } from 'mongodb';

async function start() {
  
  const url = `mongodb+srv://techDb:asnqRBrJiZ8VU3Ah@cluster0.vu7n8ge.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(url);
  const app = express();
  app.use(express.json());
  await client.connect();
  const db = client.db('fsv-db');
  
  async function populateCartIds(ids) {
    return Promise.all(ids.map(id => db.collection('products').findOne({ id })));
  }

  app.get("/hello", async (req, res) => {
    const products = await db.collection('products').find({}).toArray()
    res.send(products);
  });

  app.get("/products", async (req, res) => {
    const products = await db.collection('products').find({}).toArray()
    res.send(products);
  });

  app.get("/users/:userId/cart", async (req, res) => {
    const userId = req.params.userId
    const user = await db.collection('users').findOne({ id: parseInt(userId)});
    const populatedCart = await populateCartIds(user.cartItems);
    res.json(populatedCart);
  });

  app.post("/users/:userId/cart", async (req, res) => {
    const userId = req.params.userId;
    const productId = req.body.id
    await db.collection('users').updateOne({ id: userId}, { 
      $addToSet: { cartItems: productId }
    });
    const user = await db.collection('users').findOne({ id: userId });
    const populatedCart = await populateCartIds(user.cartItems);
    res.json(populatedCart)
  });

  app.delete("/users/:userId/cart/:productId", async(req, res) => {
    const productId = req.params.productId
    const userId = req.params.userId;
    await db.collection('users').updateOne({ id: userId}, { 
      $pull: { cartItems: productId }
    });
    const user = await db.collection('users').findOne({ id: userId });
    const populatedCart = await populateCartIds(user.cartItems);
    res.json(populatedCart)
  });

  app.get("/products/:productId", async (req, res) => {
    const productId = req.params.productId
    const product = await db.collection('products').findOne({id: productId})
    res.json(product)
  });

  app.listen(8000, () => {
    console.log("Server is listening on port 8000")
  });

}

start();


