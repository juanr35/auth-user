export default async function handler (req, res) {
  console.log("header en auth")
  console.log(req)
  return res.status(201).json(req.headers)  
};