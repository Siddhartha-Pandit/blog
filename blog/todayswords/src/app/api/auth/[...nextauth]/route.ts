import NextAuth, { NextAuthOptions } from "next-auth";
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
    // ✅ Sign in callback: create user if needed
    async signIn({ profile }) {
      if (!profile?.email) return false;

      const googleProfile = profile as Record<string, any>;
      await dbConnect();

      let user = await User.findOne({ email: profile.email });

      if (!user) {
        // Ensure a default tenant exists
        let tenant = await Tenant.findOne({ name: "Default Tenant" });
        if (!tenant) tenant = await Tenant.create({ name: "Default Tenant" });

        const userName = profile.name
          ? profile.name.replace(/\s+/g, "").toLowerCase()
          : profile.email.split("@")[0].toLowerCase();

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

    // ✅ JWT callback: include user info in token
    async jwt({ token, user }) {
      await dbConnect();

      if (user) {
        const existingUser = await User.findOne({ email: user.email }).populate("tenantId");

        if (existingUser) {
          token.id = existingUser._id?.toString() || "";
          // Ensure tenantId is always a string
          const tenantId =
            typeof existingUser.tenantId === "object" && "_id" in existingUser.tenantId
              ? (existingUser.tenantId._id as mongoose.Types.ObjectId).toString()
              : (existingUser.tenantId as string);

          token.tenantId = tenantId || "";
          token.role = typeof existingUser.role === "string" ? existingUser.role : "member";
          token.userName = existingUser.userName || "";
        }
      }

      return token;
    },

    // ✅ Session callback: safely map token -> session
    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: (token.id as string) || "",
          tenantId: (token.tenantId as string) || "",
          role: (token.role as string) || "member",
          userName: token.userName || "",
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
