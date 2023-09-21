import getConnection from "./dbConnect";

export default async function dbClient(dbName) {

  let conn = await getConnection(dbName)
  return conn.getClient()
}