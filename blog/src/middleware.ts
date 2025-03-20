// blog/src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Return true if user is authenticated
      return !!token;
    },
  },
  pages: {
    signIn: "/login", // Custom login page
  },
});

// Applies middleware to specific routes
export const config = {
  matcher: [
    "/dashboard/:path*", // Protect all dashboard routes
    // Add other protected routes here if needed
  ],
};
