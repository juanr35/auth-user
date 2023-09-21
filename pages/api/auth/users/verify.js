import { getConnection, closeConnectionMongoose } from "../../../../lib/mongoose/dbConnect";
import { 
  getModel, 
  findOneMongoose, 
  createUserCredentialMongoose, 
  createDocumentMongoose,
  createVerificationMongoose,
  findByIdMongoose,
  findByIdAndUpdateMongoose,
  findByIdAndDeleteMongoose,
} from "../../../../lib/mongoose/dbModel";
import { mongoConnect, findOneMongoDriver, closeConnectionMongoDriver } from "../../../../lib/mongodb/utils";
import userSchema from "../../../../models/User";
import accountSchema from "../../../../models/Account";
import userVerifySchema from "../../../../models/UserVerify";
import assert from "assert"
import { sendMail } from "../../../../lib/nodeMailer/send-mail";

const dbName = process.env.DATABASE_NAME

export default async function handler (req, res) {
  
  let connDb
  let session

  try {
    connDb = await getConnection(dbName)  
   
    let User = getModel("User", userSchema, connDb)
    let Verify = getModel("Verify", userVerifySchema, connDb)
    
    let userDoc = await User.findById(req.body._id).populate("verifyId")

    if( userDoc.verified ) {
      return res.status(401).json({ msg: "The user is already verified" });
    }
    
    if ( userDoc.verifyId?.hash ) {

      if ( userDoc.verifyId.hash === req.body.code ) {        
        console.log("success login")

        session = await connDb.startSession();    
        session.startTransaction();
  
        let deletedDoc = await findByIdAndDeleteMongoose(Verify, userDoc.verifyId, session)
        assert.ok( deletedDoc );
  
        let update = { verified: true, verifyId: null }
        let newUserDoc = await findByIdAndUpdateMongoose(User, userDoc._id, update, session)
        assert.ok( newUserDoc );
        
        
        await session.commitTransaction();
        session.endSession();
  
        return res.status(201).json(newUserDoc)
      }
      else {
        return res.status(401).json({ msg: "Invalid code" });
      }
    }
    else {
      console.log("Expired code")

      session = await connDb.startSession();    
      session.startTransaction();

      let verifyDoc = await createVerificationMongoose(Verify, session)
      assert.ok( await Verify.findById(verifyDoc._id).session(session) );

      let newUserDoc = await findByIdAndUpdateMongoose(User, userDoc._id, { verifyId: verifyDoc._id }, session)
      assert.ok( newUserDoc );
      
      let mailInfo = await sendMail(verifyDoc.hash, userDoc.email)
      assert.ok( mailInfo );
      
      await session.commitTransaction();
      return res.status(401).json({ msg: "Expired code" });
    }
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
  }
};