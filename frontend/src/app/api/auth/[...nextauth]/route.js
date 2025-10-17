// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Django",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/login/`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            { withCredentials: true }
          );

          const user = res.data?.data;

          if (res.data.success && user) {
            // Return user info to NextAuth
            return {
              id: user.id || user.email,
              name: user.name || user.email,
              email: user.email,
              token: user.token || null,
            };
          } else {
            throw new Error(res.data.message || "Login failed");
          }
        } catch (error) {
          console.error("Login error:", error.response?.data || error.message);
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
