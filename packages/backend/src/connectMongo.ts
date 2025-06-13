import { MongoClient } from "mongodb";

import dotenv from "dotenv";
dotenv.config();



export function connectMongo() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;

    const connectionStringRedacted = `mongodb+srv://${MONGO_USER}:<password>@${MONGO_CLUSTER}/${DB_NAME}`;
    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;
    console.log("Attempting Mongo connection at " + connectionStringRedacted);

    return new MongoClient(connectionString);
}

export const mongoClient = connectMongo();
mongoClient.db().listCollections().toArray().then(data => console.log(data))