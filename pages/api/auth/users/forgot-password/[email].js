import { getConnection, closeConnectionMongoose } from "../../../../../lib/mongoose/dbConnect";
import { 
  getModel, 
  findOneMongoose, 
  createUserCredentialMongoose, 
  createDocumentMongoose,
  createVerificationMongoose,
  findByIdMongoose,
  findByIdAndUpdateMongoose,
  findByIdAndDeleteMongoose,
} from "../../../../../lib/mongoose/dbModel";
import { mongoConnect, findOneMongoDriver, closeConnectionMongoDriver } from "../../../../../lib/mongodb/utils";
import userSchema from "../../../../../models/User";
import accountSchema from "../../../../../models/Account";
import userVerifySchema from "../../../../../models/UserVerify";
import assert from "assert"
import { sendMail } from "../../../../../lib/nodeMailer/send-mail";
import { useRouter } from 'next/router';

const dbName = process.env.DATABASE_NAME

export default async function handler (req, res) {
  
  let connDb
  let session
  const { email } = req.query;
  const { 
    method,
    body
   } = req

  switch (method) {
    case 'GET':
      try {
        connDb = await getConnection(dbName)  
       
        let User = getModel("User", userSchema, connDb)
        let Verify = getModel("Verify", userVerifySchema, connDb)
    
        let userDoc = await User.findOne({ 
          email,
          type: 'credential'    
        }).populate("verifyId")
    
        if( !userDoc ) {
          return res.status(401).json({ msg: "The email don't exist" });
        }
    
        session = await connDb.startSession();    
        session.startTransaction();
    
        if ( userDoc.verifyId?.hash ) {
          let deletedDoc = await findByIdAndDeleteMongoose(Verify, userDoc.verifyId, session)
          assert.ok( deletedDoc );
        }  
    
        let verifyDoc = await createVerificationMongoose(Verify, session)
        assert.ok( await Verify.findById(verifyDoc._id).session(session) );
    
        let newUserDoc = await findByIdAndUpdateMongoose(User, userDoc._id, { verifyId: verifyDoc._id }, session)
        assert.ok( newUserDoc );
        
        let mailInfo = await sendMail(verifyDoc.hash, userDoc.email)
        assert.ok( mailInfo );
        
        await session.commitTransaction();
        return res.status(201).json({ msg: "Sent code" });    
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

    case 'POST':
      try {
        connDb = await getConnection(dbName)  
       
        let User = getModel("User", userSchema, connDb)
        let Verify = getModel("Verify", userVerifySchema, connDb)
    
        let userDoc = await User.findOne({ 
          email,
          type: 'credential'    
        }).populate("verifyId")
    
        if( !userDoc ) {
          return res.status(401).json({ msg: "The email don't exist" });
        }

        if ( userDoc.verifyId ) {

          if ( userDoc.verifyId?.hash === body.code ) {
            
            if ( body?.password ) {
              session = await connDb.startSession();    
              session.startTransaction();

              let deletedDoc = await findByIdAndDeleteMongoose(Verify, userDoc.verifyId, session)
              assert.ok( deletedDoc );

              let update = { verifyId: null }
              let newUserDoc = await findByIdAndUpdateMongoose(User, userDoc._id, update, session)
              assert.ok( newUserDoc );

              //let obj = { password: userSchema.encryptPassword(body.password) }
              let obj = { password: userSchema.methods.encryptPassword(body.password) }
              let newPasswordDoc = await findByIdAndUpdateMongoose(User, userDoc._id, obj, session)
              assert.ok( newPasswordDoc );

              await session.commitTransaction();
              session.endSession();

              return res.status(201).json({ msg: "Password changed" })
            }
            else {
              return res.status(201).json({ msg: "Accepted code" })
            }
          }
          else {  
            let msg          
            session = await connDb.startSession();    
            session.startTransaction();

            if ( userDoc.verifyId.attempts <= 1 ) {
              let deletedDoc = await findByIdAndDeleteMongoose(Verify, userDoc.verifyId, session)
              assert.ok( deletedDoc );
          
              let verifyDoc = await createVerificationMongoose(Verify, session)
              assert.ok( await Verify.findById(verifyDoc._id).session(session) );
          
              let newUserDoc = await findByIdAndUpdateMongoose(User, userDoc._id, { verifyId: verifyDoc._id }, session)
              assert.ok( newUserDoc );

              let mailInfo = await sendMail(verifyDoc.hash, userDoc.email)
              assert.ok( mailInfo );
              
              msg = "A new code has been sent"
            }

            else {
              let newUserDoc = await findByIdAndUpdateMongoose(Verify, userDoc.verifyId, { 
                attempts: userDoc.verifyId.attempts - 1 }, session)
              assert.ok( newUserDoc );        

              msg = "Invalid code"
            }
            
            await session.commitTransaction();
            return res.status(401).json({ msg });
          }
        }
        else {
          return res.status(401).json({ msg: 'Error invalid' });  
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

    default:
      return res.status(401).json({ msg: "This method is not supported" });
  }
};