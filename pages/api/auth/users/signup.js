import { getConnection, closeConnectionMongoose } from "../../../../lib/mongoose/dbConnect";
import { 
  getModel, 
  findOneMongoose, 
  createUserCredentialMongoose, 
  createDocumentMongoose,
  createVerificationMongoose,
  findByIdMongoose,
} from "../../../../lib/mongoose/dbModel";
import { mongoConnect, findOneMongoDriver, closeConnectionMongoDriver } from "../../../../lib/mongodb/utils";
import userSchema from "../../../../models/User";
import accountSchema from "../../../../models/Account";
import userVerifySchema from "../../../../models/UserVerify";
import assert from "assert"
import { sendMail } from "../../../../lib/nodeMailer/send-mail";

const dbName = process.env.DATABASE_NAME

export default async function handler (req, res) {
  
  let session
  let connDb
  
  try {
    /* Search in credentials database */              
    connDb = await getConnection(dbName)
    let User = getModel("User", userSchema, connDb)
    let user = await findOneMongoose(User, {
      email: req.body.email,
      type: 'credential'
    })

    if (user) {
      return res.status(401).json({ msg: "The email has already been registered" });
    }
        
    /* Create user acconunt */
    session = await connDb.startSession();    
    session.startTransaction();
    
    let Verify = getModel("Verify", userVerifySchema, connDb)
    let verifyDoc = await createVerificationMongoose(Verify, session)
    assert.ok( await Verify.findById(verifyDoc._id).session(session) );
    
    /* Check if data account exist in oauth registry */
    let _id
    user = await findOneMongoose(User, {
      email: req.body.email,
      type: 'oauth'
    })
    if (user) {
      _id = user.accountId
    }
    else {
      let Account = getModel("Account", accountSchema, connDb)
      let accountDoc = await createDocumentMongoose(Account, { primer_nombre: req.body.name }, session)
      assert.ok( await Account.findById(accountDoc._id).session(session) );
      _id = accountDoc._id
    } 

    let userDoc = await createUserCredentialMongoose(User, { 
        type: 'credential',
        email: req.body.email,
        password: req.body.password,
        accountId: _id,
        verifyId: verifyDoc._id
      }, session)
    
    let mailInfo = await sendMail(verifyDoc.hash, req.body.email)
    assert.ok( mailInfo );

    await session.commitTransaction();    
    return res.status(201).json(userDoc)
  } 
  catch (error) {
    console.log(error)
    if (typeof session !== "undefined") {
      await session.abortTransaction();
    }
    return res.status(500).json({ msg: error.message });
  }
  finally {
    if (typeof session !== "undefined") {  
      await session.endSession();
    }
    // Close the connection to the MongoDB cluster
    //await closeConnectionMongoose(connDb)
    //await closeConnectionMongoDriver(client, dbName)
  }
};