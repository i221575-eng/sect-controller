import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { GithubProfile } from 'next-auth/providers/github'
import { GoogleProfile } from 'next-auth/providers/google'
import { connectDB } from '@/utils/db'
import { User } from '@/models/user'

export const options: NextAuthOptions = {
    providers: [
        GitHubProvider({
            async profile(profile: GithubProfile) {
                await connectDB();
                const user = await User.findOne({ email: profile.email });
                let role = "unauthorized";
                if (user && user.status) {
                    role = user.role;
                    await User.findOneAndUpdate({ email: profile.email }, {
                        name: profile.name || profile.login,
                        image: profile.avatar_url,
                    });
                }
                return {
                    ...profile,
                    id: profile.id.toString(),
                    name: profile.name || profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                    role: role,
                }
            },
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            async profile(profile: GoogleProfile) {
                await connectDB();
                const user = await User.findOne({ email: profile.email });
                let role = "unauthorized";
                if (user && user.status) {
                    role = user.role;
                    await User.findOneAndUpdate({ email: profile.email }, {
                        name: profile.name,
                        image: profile.picture,
                    });
                }
                return {
                    ...profile,
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: role,
                }
            },
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email:",
                    type: "text",
                    placeholder: "email"
                },
                password: {
                    label: "Password:",
                    type: "password",
                    placeholder: "password"
                }
            },
            async authorize(credentials) {
                // This is where you need to retrieve user data 
                // to verify with credentials
                // Docs: https://next-auth.js.org/configuration/providers/credentials
                const user = { id: "42", name: "Admin", email: "admin@ztna.com", password: "$ec@123", role: "superadmin" }

                if (credentials?.email === user.email && credentials?.password === user.password) {
                    return user
                } else {
                    return null
                }
            }
        })
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token
        },
        session({ session, token }) {
            if (session?.user) session.user.role = token.role;
            return session
        },
    }
}
