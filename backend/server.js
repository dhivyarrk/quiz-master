// Import necessary modules for server (Oak) and database (MongoDB) management
import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { MongoClient } from "npm:mongodb@6.3.0";
import "https://deno.land/x/dotenv/load.ts";

// Import route handlers for achievements, players, and questions
import createAchievementRoutes from "./routes/achievementRoutes.js";
import createPlayerRoutes from "./routes/playerRoutes.js";
import createQuestionRoutes from "./routes/questionRoutes.js";

// Import CORS middleware
import { oakCors } from "https://deno.land/x/cors/mod.ts";

// Set up environment variables for MongoDB URI and database names
const MONGO_URI = Deno.env.get("MONGO_URI") || "mongodb://localhost:27017";

// Check for MONGO_URI, exit if not set
if (!MONGO_URI) {
  console.error("MONGO_URI is not set");
  Deno.exit(1);
}

const MONGO_DB_NAME_USERS = Deno.env.get("MONGO_DB_NAME_USERS") || "users";
const MONGO_DB_NAME_QUESTIONS = Deno.env.get("MONGO_DB_NAME_QUESTIONS") || "questions";
const MONGO_DB_NAME_ACHIEVEMENTS = Deno.env.get("MONGO_DB_NAME_ACHIEVEMENTS") || "achievements";

// Initialize MongoDB client with URI
const client = new MongoClient(MONGO_URI);

console.log(MONGO_URI);

// Attempt to connect to MongoDB and handle any connection errors
try {
  await client.connect();
  console.log("🟢 Connected to MongoDB successfully");
} catch (error) {
  console.error("🔴 Error connecting to MongoDB", error);
  Deno.exit(1);
}

// Select individual databases for users, questions, and achievements
const usersDb = client.db(MONGO_DB_NAME_USERS);
const questionsDb = client.db(MONGO_DB_NAME_QUESTIONS);
const achievementsDb = client.db(MONGO_DB_NAME_ACHIEVEMENTS);

// Set up collections for each type of data
const usersCollection = usersDb.collection("Users");
const questionsCollection = questionsDb.collection("Questions");
const achievementsCollection = achievementsDb.collection("Achievements");

// Initialize Oak application
const app = new Application();

// Use CORS middleware
app.use(oakCors({ origin: "http://localhost:5173" })); // Allow requests from your frontend

// Use player routes, with separate methods for allowed methods
app.use(createPlayerRoutes(usersCollection).routes());
app.use(createPlayerRoutes(usersCollection).allowedMethods());

// Achievement and question routes with respective collections
app.use(createAchievementRoutes(achievementsCollection).routes());
app.use(createAchievementRoutes(achievementsCollection).allowedMethods());

app.use(createQuestionRoutes(questionsCollection).routes());
app.use(createQuestionRoutes(questionsCollection).allowedMethods());

// Start server on port 8000
console.log("Server is running on port 8000");
await app.listen({ port: 8000 });

// Export client and collections for potential use elsewhere in the app
export { client, questionsCollection };