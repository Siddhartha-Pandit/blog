import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/db";
import { User } from "@/models/user.model";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    session: { strategy: "jwt" },

    callbacks: {
        // ✅ Sign in callback: create user if needed (no tenant logic)
        async signIn({ profile }) {
            if (!profile?.email) return false;

            const googleProfile = profile as Record<string, any>;
            await dbConnect();

            let user = await User.findOne({ email: profile.email });

            if (!user) {
                const userName = profile.name
                    ? profile.name.replace(/\s+/g, "").toLowerCase()
                    : profile.email.split("@")[0].toLowerCase();

                user = await User.create({
                    name: profile.name,
                    email: profile.email,
                    image: googleProfile.picture,
                    role: "member",
                    userName,
                });
            }

            return true;
        },

        // ✅ JWT callback: keep only basic info
        async jwt({ token, user }) {
            await dbConnect();

            if (user || !token.id) {
                const email = user?.email || token.email;

                if (email) {
                    const existingUser = await User.findOne({ email });

                    if (existingUser) {
                        token.id = existingUser._id?.toString() || "";
                        token.role = typeof existingUser.role === "string" ? existingUser.role : "member";
                        token.userName = existingUser.userName || "";
                    }
                }
            }

            return token;
        },

        // ✅ Session callback: simplified
        async session({ session, token }) {
            if (token && session.user) {
                session.user = {
                    ...session.user,
                    id: (token.id as string) || "",
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
