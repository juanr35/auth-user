import { 
  mongoConnect, 
  createDocumentMongoDriver, 
  findOneMongoDriver, 
  findOneByIdMongoDriver, 
  closeConnectionMongoDriver 
} from "../../../../../lib/mongodb/utils";
import { getConnection, closeConnectionMongoose } from "../../../../../lib/mongoose/dbConnect";
import { getModel, findOneMongoose, createDocumentMongoose } from "../../../../../lib/mongoose/dbModel";
import userSchema from "../../../../../models/User";
import assert from "assert"

const dbName = process.env.DATABASE_NAME

export default async function handler(req, res) {

  let session 
  let client
 
  try {
    /* Search in oauth database */
    client = await mongoConnect(dbName)
    let user = await findOneMongoDriver(client, "users", { 
      email: req.body.email,
      type: 'oauth'
    })
    
    if (user) {
      return res.status(201).json(user)
    }

    const session = client.startSession();
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };

    await session.withTransaction(async () => {
      
      /* Check if data account exist in user credential registry */
      let _id
      user = await findOneMongoDriver(client, "users", { 
        email: req.body.email,
        type: 'credential'
      })
      if (user) {
        _id = user.accountId
      }
      else {
        const newAccount = await createDocumentMongoDriver(client, "accounts", {
            primer_nombre: req.body?.name ? req.body.name.split(' ')[0] : null
          }, session);
        assert.ok( newAccount );
        _id = newAccount.insertedId
      }
      
      let contentDoc = {
        ...req.body,
        type: 'oauth',
        verified: true,
        accountId: _id
      }
      const newUser = await createDocumentMongoDriver(client, "users", contentDoc, session);
      assert.ok( newUser );
        
      return res.status(201).json({ _id: newUser.insertedId, ...contentDoc })
      
    }, transactionOptions);
    
  } 
  catch (error) {
    console.log(error)
    if (typeof session !== "undefined") {
      await session.abortTransaction();
      
    }
    return res.status(400).json({ msg: error.message });
  }
  finally {
    if (typeof session !== "undefined") {  
      await session.endSession();
    }
    //await closeConnectionMongoose(connAuth)
    //await closeConnectionMongoDriver(client, dbName)
  }
}