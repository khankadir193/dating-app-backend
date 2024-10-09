const Hapi = require('@hapi/hapi');
const { MongoClient } = require('mongodb');

const init = async () => {
  // Create a Hapi server instance
  const server = Hapi.server({
    port: 3001,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'], // Allow all origins
        headers: ['Accept', 'Content-Type', 'Authorization'],
        additionalHeaders: ['X-Requested-With']
      }
    }
  });

  // Connection URI for MongoDB Atlas
  const uri = "mongodb+srv://abdulkadirk059:EKnPnmbDcde0lm0i@dateapp-cluster.cyunp.mongodb.net/?retryWrites=true&w=majority&appName=dateApp-cluster";

  // Create a MongoClient
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Get a reference to the database
    const database = client.db('dates-web'); // Replace 'myDatabase' with your database name

    // Example collection and data
    const collection = database.collection('myCollection'); // Replace 'myCollection' with your collection name

    server.route({
      method:'POST',
      path:'/insert',
      handler: async (request,h) => {
        const result = await collection.insertOne(request.payload);
        console.log('request...data coming from frontend',request.payload);
        return h.response(result).code(200);
      }
    });

    // Example route to insert a document
    // server.route({
    //   method: 'GET',
    //   path: '/insert',
    //   handler: async (request, h) => {
    //     try {
    //       const result = await collection.insertOne({ name: "Alice", age: 25, city: "New York" });
    //       return `Document inserted with ID: ${result.insertedId}`;
    //     } catch (error) {
    //       console.error(error);
    //       return h.response('Failed to insert document').code(500);
    //     }
    //   }
    // });

    // Example route to retrieve documents
    server.route({
      method: 'GET',
      path: '/documents',
      handler: async (request, h) => {
        try {
          const documents = await collection.find({}).toArray();
          return documents;
        } catch (error) {
          console.error(error);
          return h.response('Failed to retrieve documents').code(500);
        }
      }
    });

    // Start the server
    await server.start();
    console.log('Server running on %s', server.info.uri);

  } catch (e) {
    console.error(e);
  }

  // Ensure client will close when you finish/error
  process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};

init();
