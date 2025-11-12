import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import dbConnect from "./lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "./models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // VIMP: We are telling Next-Auth to use our MongoDB database
  // to store all authentication data (users, sessions, etc.)
  adapter: MongoDBAdapter(
    // We pass the dbConnect function as a promise
    dbConnect().then(mongoose => mongoose.connection.getClient())
  ),

  // We are defining our login methods
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),

    // --- This is our custom Email/Password login provider ---
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      
      // This function runs when a user tries to log in
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Please provide email and password.");
        }

        // Connect to the database
        await dbConnect();

        // Find the user in our 'users' collection
        const user = await User.findOne({ email: credentials.email });

        // If no user found, or if they don't have a password (e.g., Google login)
        if (!user || !user.password) {
          throw new Error("Invalid email or password.");
        }

        // Check if the password is correct
        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatch) {
          throw new Error("Invalid email or password.");
        }

        // If everything is correct, return the user object
        // This user object is what Next-Auth will use
        return user;
      },
    }),
  ],

  // --- Callbacks ---
  // Callbacks are functions that run at specific points
  // We use them to add extra info (like role) to the session
  callbacks: {
    async session({ session, user, token }) {
      // If using JWT strategy, `token` has the data.
      // If using database (adapter) strategy, `user` has the data.

      // Add our custom fields from the User model to the session object
      // so we can access them in our app (e.g., `session.user.role`)
      session.user.id = user.id; // user.id is the _id from MongoDB
      session.user.role = user.role;
      
      return session;
    },
  },

  // We are using a database adapter, so our strategy is 'database'
  session: {
    strategy: "database",
  },
  
  // Define custom pages (optional, but good for production)
  pages: {
    signIn: '/login',
    error: '/login?error=true',
  },
});