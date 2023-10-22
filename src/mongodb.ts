import { ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

const uri = "mongodb+srv://dawidczech355a:Test123@quizowanie.2yalqi4.mongodb.net/quizowanie?retryWrites=true&w=majority";

export async function mongoConnection() {
  await mongoose.connect(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
