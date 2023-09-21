import { use } from "bcrypt/promises";
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
import userSchema from "../../../../models/User";
import userVerifySchema from "../../../../models/UserVerify";
import assert from "assert"
import { sendMail } from "../../../../lib/nodeMailer/send-mail";

const dbName = process.env.DATABASE_NAME

export default async (req, res) => {
  
  let conn
  let session
  
  try {            
      conn = await getConnection(dbName)
      let User = getModel("User", userSchema, conn)
      //let user = await User.findOne({email: req.body.email})
      let target = { email: req.body.email, type: 'credential' }
      let user = await findOneMongoose(User, target)
      
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({ msg: "User not found or incorrect password" });
      }

      if ( !user.verified ) {

        let Verify = getModel("Verify", userVerifySchema, conn)
        await user.populate("verifyId")

        if ( !user.verifyId ) {
          console.log("Expired code")
  
          session = await conn.startSession();    
          session.startTransaction();
    
          let verifyDoc = await createVerificationMongoose(Verify, session)
          assert.ok( await Verify.findById(verifyDoc._id).session(session) );
    
          let newUserDoc = await findByIdAndUpdateMongoose(User, user._id, { verifyId: verifyDoc._id }, session)
          assert.ok( newUserDoc );
          
          let mailInfo = await sendMail(verifyDoc.hash, newUserDoc.email)
          assert.ok( mailInfo );
          
          await session.commitTransaction();
          return res.status(201).json(newUserDoc)
        }
      }

      return res.status(201).json(user)
  } 
  catch (error) {
      console.log(error)
      return res.status(500).json({ msg: error.message });
  }
  finally {
    if (typeof session !== "undefined") {  
      await session.endSession();
    }
    // Close the connection to the MongoDB cluster
    //closeConnectionMongoose(conn)
  }
};
  