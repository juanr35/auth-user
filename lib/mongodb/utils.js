import { MongoClient } from "mongodb";

/**
* Create a new Airbnb listing
* @param {String} dbName The name of database
*/
export async function mongoConnect(dbName) {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
     const uri = `${process.env.DATABASE_URI}/${dbName}?retryWrites=true&w=majority`
    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client =  new MongoClient(uri, {useUnifiedTopology: true})
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
      await client.connect();
      console.log(`Connected to db: ${dbName} - mongoclient`);
      return client
      
    } 
    catch (e) {
      console.error(e);
      throw "Connect Failed"
    } 
}

/**
* Create a new document
* @param {MongoClient} client A MongoClient that is connected to a cluster 
* @param {String} collection The collection of database
* @param {Object} newDocument The new document to be added
*/
export async function createDocumentMongoDriver(client, collection, newDocument, session = null){
  //const result = await client.db(dbName).collection("oauth_profiles").insertOne(newDocument);
  const result = await client.db().collection(collection).insertOne(newDocument, { session });
  console.log(`New listing created in the collection: '${collection}' with the following id: ${result.insertedId}`);
  return result
}

/**
* Print a document with the given email
* Note: If more than one listing has the same name, only the first listing the database finds will be printed.
* @param {MongoClient} client A MongoClient that is connected to a cluster
* @param {String} nameOfListing The name of the listing you want to find
*/
export async function findOneMongoDriver(client, collection, target) {
  //const result = await client.db(dbName).collection("oauth_profiles").findOne({ email: target });
  const result = await client.db().collection(collection).findOne(target);

  if (result) {
      console.log(`Found a listing in the collection '${collection}' with the data: '${JSON.stringify(target)}' - mongoclient`);
      return result
  } else {
      console.log(`No listings found with the email '${JSON.stringify(target)}' - mongoclient`);
      return null
  }
}

/**
* Print a document with the given email
* Note: If more than one listing has the same name, only the first listing the database finds will be printed.
* @param {MongoClient} client A MongoClient that is connected to a cluster
* @param {String} nameOfListing The name of the listing you want to find
* Not works with transactions and sessions
*/
export async function findOneByIdMongoDriver(client, collection, id) {
  //const result = await client.db(dbName).collection("oauth_profiles").findOne({ email: target });
  const result = await client.db().collection(collection).findOne({ _id: id });

  if (result) {
      console.log(`Found a listing in the collection with the id: '${id}' - mongoclient`);
      return result
  } else {
      console.log(`No listings found with the id: '${id}' - mongoclient`);
      return null
  }
}

export async function closeConnectionMongoDriver(client, dbName = "") {
  
  if (typeof client !== "undefined") {
    await client.close();
    console.log(`db: ${dbName} disconnected! - mongoclient`);
  }
}