import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbconnect";
import { User } from "@/models/user.model";
import { Tenant } from "@/models/tenant.model";
import mongoose from "mongoose";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false;

      const googleProfile = profile as Record<string, any>;
      await dbConnect();

      let user = await User.findOne({ email: profile.email });

      if (!user) {
        let tenant = await Tenant.findOne({ name: "Default Tenant" });
        if (!tenant) {
          tenant = await Tenant.create({ name: "Default Tenant" });
        }

        user = await User.create({
          name: profile.name,
          email: profile.email,
          image: googleProfile.picture, // ✅ safe
          tenantId: tenant._id,
          role: "member",
        });
      }

      return true;
    },

    async session({ session }) {
      await dbConnect();

      const user = await User.findOne({ email: session.user?.email }).populate("tenantId");

      if (user) {
        session.user.id = (user._id as mongoose.Types.ObjectId).toString();
        session.user.tenantId = (user.tenantId as any)._id?.toString?.() ?? "";
        session.user.role = user.role;
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
