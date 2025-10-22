// /lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db";
import { User } from "@/models/user.model";
import { Tenant } from "@/models/tenant.model";
import mongoose from "mongoose";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    /** ✅ Runs on first sign-in — creates user + default tenant if needed */
    async signIn({ profile }) {
      if (!profile?.email) return false;

      await dbConnect();
      const googleProfile = profile as Record<string, any>;

      // Find or create user
      let user = await User.findOne({ email: profile.email });
      if (!user) {
        // Ensure default tenant exists
        let tenant = await Tenant.findOne({ name: "Default Tenant" });
        if (!tenant) tenant = await Tenant.create({ name: "Default Tenant" });

        const userName =
          profile.name?.replace(/\s+/g, "").toLowerCase() ||
          profile.email.split("@")[0].toLowerCase();

        user = await User.create({
          name: profile.name,
          email: profile.email,
          image: googleProfile.picture,
          tenantId: tenant._id,
          role: "member",
          userName,
        });
      }

      return true;
    },

    /** ✅ Include user info inside JWT token */
    async jwt({ token, user }) {
      await dbConnect();

      if (user) {
        const existingUser = await User.findOne({ email: user.email }).populate("tenantId");

        if (existingUser) {
          token.id = existingUser._id?.toString() || "";

          // Convert tenantId to string safely
          const tenantId =
            typeof existingUser.tenantId === "object" && "_id" in existingUser.tenantId
              ? (existingUser.tenantId._id as mongoose.Types.ObjectId).toString()
              : (existingUser.tenantId as string);

          token.tenantId = tenantId || "";
          token.role = existingUser.role || "member";
          token.userName = existingUser.userName || "";
        }
      }

      return token;
    },

    /** ✅ Map JWT token → NextAuth session */
    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: (token.id as string) || "",
          tenantId: (token.tenantId as string) || "",
          role: (token.role as string) || "member",
          userName: (token.userName as string) || "",
        };
      }
      return session;
    },
  },
};
