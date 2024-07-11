const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json())


// function verifyJWT(req,res,next){
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: 'Unauthorized access' }); //401 mane unothorized
//   }
//   const token = authHeader.split(' ')[1];
//   console.log(token);
  // verify a token symmetric
  // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
  //   if(err){
  //     return res.status(403).send({ message: 'Forbidden access' });
  //   }
  //     console.log('decoded', decoded);
  // })
  // console.log('inside verifyJWT', authHeader);
//   next();
// }

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: 'unAuthorized access' });
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//     if (err) {
//       return res.status(403).send({ message: 'Forbidden access' });
//     }
//      console.log('decoded', decoded);
//      req.decoded = decoded;
//     next();
//   });
// }



const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: 'unauthorized access' });
    }
    req.decoded = decoded;
    next();
  });
};






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkjuk.mongodb.net/?retryWrites=true&w=majority`;

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
   
    await client.connect();
    
    const serviceCollection = client.db('geniusCar2023').collection('carservices');
    const OrderCollection = client.db('geniusCar2023').collection('order');

    app.get('/services', async (req, res) => {
      const query = {};
      const result = await serviceCollection.find(query).toArray();
      res.send(result);
    })


    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    })

    app.post('/services', async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result);

    })


    app.delete('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await serviceCollection.deleteOne(query)
      res.send(result);
    })


    //order collection api
    app.post('/order', async (req, res) => {
      const order = req.body;
      const result = await OrderCollection.insertOne(order);
      res.send(result);
    })

    app.get('/order', async (req, res) => {
      const newEmail = req.query.email;  
      const query = { email: newEmail };
      const yourOrder = await OrderCollection.find(query).toArray();
      res.send(yourOrder);
    })

    //jwt for login
    // app.post('/login', async (req, res) => {
    //   const user = req.body;
    //   var accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: '5d',
    //   });
    //   // console.log(accessToken);
    //   res.send({accessToken});
    // })

 
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('running at 5000');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
