import express, { Request, Response } from "express";
import { mongoClient } from "./connectMongo";
import { CredentialsProvider } from "./CredentialsProvider";
import { verifyAuthToken } from "./middleware"
import { ValidRoutes } from "./ValidRoutes";
import cors from "cors"
import jwt from "jsonwebtoken";
import path from "path";


interface IAuthTokenPayload {
    username: string;
}

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR!; // "../frontend/dist"
const staticPath = path.resolve(process.cwd(), STATIC_DIR);

const app = express();
app.use(cors());
app.use(express.json()); // For JSON payloads


export const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("Missing JWT_SECRET in environment variables");
}

app.locals.JWT_SECRET = jwtSecret;

const provider = new CredentialsProvider(mongoClient);

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

app.get(Object.values(ValidRoutes), (_req, res) =>{

    res.sendFile(path.join(staticPath, "index.html"));

});



app.post("/auth/login",  (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).send({ error: "Username and password required" });
        return;
    }

    console.log(username)
    console.log(password)


    provider.verifyPassword(username, password).then(response => {

        if(response === true){

            if (!jwtSecret) 
            throw new Error("Missing JWT_SECRET in environment variables");

            const trimmedUsername = username.trim();
            generateAuthToken(trimmedUsername, jwtSecret).then(token => res.status(200).json({ token }))

        }else
            res.status(401).send({ error: "Incorrect username or password" });

    });
    
  });



app.post("/auth/register", (req, res) => {
    provider.registerUser(req.body.username,req.body.password).then(response => res.send(response))
  });



app.post("/api/dashboard/add", verifyAuthToken, async (req: Request, res: Response) => {
    const { date, event } = req.body;

    if (!date || !event) {
        res.status(400).json({ error: "Missing date or event data." });
        return;
    }

    try {
        const db = mongoClient.db(process.env.DB_NAME);
        const collectionName = process.env.DASHBOARD_COLLECTION_NAME || "dashboard";
        const dashboardCollection = db.collection(collectionName);

        // Insert a new dashboard event document

        console.log("adding event")
        console.log(`event who == ${event.who}`)
        console.log(`req.user?.username == ${req.user?.username}`)

        if(!event.who.trim())
          if(req.user?.username )
            event.who = req.user.username;
          else
              event.who = "Anonymous";

        
            

        const result = await dashboardCollection.insertOne({
        date,
        event    
    });

        res.status(201).json({
        message: "Event successfully added to dashboard.",
        insertedId: result.insertedId,
        event
        });
    } catch (err) {
        console.error("Error adding event to dashboard:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/dashboard/events", verifyAuthToken, async (req: Request, res: Response) => {

    if (!req.user?.username  || req.user?.username !== "admin") {
            res.status(403).json({ error: "Forbidden: You are not authorized to access this resource." });
            return;
      }


    try {
      const db = mongoClient.db(process.env.DB_NAME);
      const collectionName = process.env.DASHBOARD_COLLECTION_NAME || "dashboard";
      const dashboardCollection = db.collection(collectionName);
  
      // Only return the 'event' field, omit _id
      const eventsCursor = dashboardCollection.find({}, { projection: { _id: 0, event: 1 } });
      const eventDocs = await eventsCursor.toArray();
  
      // Extract just the event objects into a flat array
      const events = eventDocs.map(doc => doc.event);
  
      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching dashboard events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.delete("/api/dashboard/remove", verifyAuthToken, async (req: Request, res: Response) => {
    const { date, event } = req.body;
  
    if (!date || !event) {
        res.status(400).json({ error: "Missing date or event" });
        return;
    }
  
    try {
      const db = mongoClient.db(process.env.DB_NAME);
      const collectionName = process.env.DASHBOARD_COLLECTION_NAME || "dashboard";
      const dashboardCollection = db.collection(collectionName);
  
      const result = await dashboardCollection.deleteOne({
        date,
        event // full match on all event fields
      });
  
      if (result.deletedCount === 0) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
  
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
      console.error("Error deleting event:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  app.post("/api/dashboard/approve", verifyAuthToken, async (req: Request, res: Response) => {
    const { date, event } = req.body;
  
    if (!date || !event) {
        res.status(400).json({ error: "Missing date or event" });
        return;
    }
  
    try {
      const db = mongoClient.db(process.env.DB_NAME);
      const dashboardCollection = db.collection(process.env.DASHBOARD_COLLECTION_NAME || "dashboard");
      const eventsCollection = db.collection(process.env.EVENTS_COLLECTION_NAME || "events");
  
      // 1. Delete from dashboard
      const deleteResult = await dashboardCollection.deleteOne({
        date,
        event
      });
  
      if (deleteResult.deletedCount === 0) {
        res.status(404).json({ error: "Event not found in dashboard" });
        return;
      }
  
      // 2. Insert into events collection
      const insertResult = await eventsCollection.insertOne({
        date,
        event,
        createdAt: new Date()
      });
  
      res.status(200).json({
        message: "Event approved and moved to events collection",
        insertedId: insertResult.insertedId
      });
  
    } catch (err) {
      console.error("Error approving event:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/remove", verifyAuthToken, async (req: Request, res: Response) => 
  {
    try{

      const { date, event } = req.body;
  
      if (!date || !event) {
          res.status(400).json({ error: "Missing date or event" });
          return;
      }

      if (!req.user?.username || (req.user?.username !== "admin" && event.Who!=req.user?.username)) {
            res.status(403).json({ error: "Forbidden: You are not authorized to access this resource." });
            return;
      }

      const db = mongoClient.db(process.env.DB_NAME);
      const eventsCollection = db.collection(process.env.EVENTS_COLLECTION_NAME || "events");

      const deleteResult = await eventsCollection.deleteOne({
        date,
        event
      });

      if (deleteResult.deletedCount === 0) {
        res.status(404).json({ error: "Event not found" });
        return;
      }

      res.status(200).json({
        message: "Event removed",
      event: event});

    }catch(error){

      console.error("Error removing event");
      res.status(500).json({ error: "Internal server error" });

    }
  });


  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const db = mongoClient.db(process.env.DB_NAME);
      const eventsCollection = db.collection(process.env.EVENTS_COLLECTION_NAME || "events");
  
      // Return only the event objects
      const cursor = eventsCollection.find({}, { projection: { _id: 0, event: 1 } });
      const docs = await cursor.toArray();
  
      const events = docs.map(doc => doc.event); // flatten to array of events
      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.use(express.static(STATIC_DIR));
