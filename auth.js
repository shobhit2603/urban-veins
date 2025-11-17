import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongoClient";

import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),

  // Helpful while debugging – logs Auth.js internals in dev
  debug: process.env.NODE_ENV === "development",

  // IMPORTANT: credentials + Auth.js v5 → use JWT sessions
  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password.");
        }

        const client = await clientPromise;
        const db = client.db();

        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password.");
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatch) {
          throw new Error("Invalid email or password.");
        }

        // Very important: map MongoDB _id → id and return a plain object
        return user;
      },
    }),
  ],

  callbacks: {
    // Runs on sign in and on every subsequent request
    async jwt({ token, user }) {
      // On first login, 'user' is defined – copy stuff into the token
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
      }
      return token;
    },

    async session({ session, token }) {
      // Copy from token → session so useSession() can see it
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },

});
