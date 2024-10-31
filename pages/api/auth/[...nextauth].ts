import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";

export default async function auth(req: any, res: any) {
  const providers = [
    CredentialsProvider({
      name: "Insight",
      credentials: {},
      // @ts-ignore
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        if (!username || !password) {
          throw new Error("Missing username or password");
        }
        const user = await prisma.user.findFirst({
          where: {
            username,
          },
        });
        // if user doesn't exist or password doesn't match
        if (!user || !(await compare(password, user.password))) {
          throw new Error("Invalid username or password");
        }

        return user;
      },
    }),
  ]

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        session.accessToken = token.accessToken
        session.user = token.user
        return session
      },
      async jwt({ token, user, account }) {
        // Persist the OAuth access_token and or the user id to the token right after signin
        if (account) {
          token.accessToken = account.access_token
          token.user = user
        }
        return token
      }
    },
  })
}
