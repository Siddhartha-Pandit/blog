// blog/src/app/api/auth/[...nextauth]/authOptions.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn({ user, account }) {
      try {
        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
          console.log("User exists:", existingUser.email);
          return;
        }

        // Generate a base username from email or name
        const baseUsername =
          user.email?.split("@")[0] ||
          user.name?.replace(/\s/g, "").toLowerCase() ||
          `user${Math.random().toString(36).slice(2, 6)}`;

        // Ensure unique username
        let username = baseUsername;
        let counter = 1;
        while (await User.findOne({ userName: username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        // Create the new user
        await User.create({
          fullName: user.name || "New User",
          userName: username,
          email: user.email,
          image: user.image || "",
          provider: account?.provider,
          providerId: account?.providerAccountId,
        });

        console.log("New user created in MongoDB");
      } catch (error) {
        console.error("Database Error:", error);
        if (error instanceof Error) {
          throw new Error("Database Error: " + error.message);
        }
        throw new Error("Database Error: An unknown error occurred.");
      }
    },
  },
};
