import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.body;

  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const database = client.db(process.env.MONGO_DB);
    const collection = database.collection(process.env.MONGO_COLLECTION);

    async function getQuery(id) {
      if (id) {
        return await collection.findOne({ id: parseInt(id, 16) }, { _id: 0 });
      } else {
        const response = await collection
          .aggregate([{ $sample: { size: 1 } }])
          .toArray();
        return response[0];
      }
    }

    const data = await getQuery(id);
    const handle = data?.handle.slice(0, data.handle.length - 5);
    const textResponse = handle
      ? `${handle} is a ${data.label === 0 ? "BOT" : "HUMAN"}`
      : `${id} has not yet been analyzed`;

    res.status(200).json({ textResponse, id: data?.id, handle: handle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  } finally {
    await client.close();
  }
}
