import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { GithubProfile } from 'next-auth/providers/github'
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
            // GitHub now sends an `iss` parameter in OAuth callbacks that next-auth v4
            // mistaken treats as an OIDC issuer check if not explicitly configured.
            // Limiting checks to ["state"] alone may not skip the issuer validation on Vercel.
            issuer: "https://github.com",
            checks: ["state"],
        }),
        // GoogleProvider removed — add GOOGLE_ID and GOOGLE_SECRET to .env.local to re-enable
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
