import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      role: string;
      userName;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    tenantId: string;
    role: string;
  }
}
