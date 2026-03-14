// Without a defined matcher, this one line applies next-auth 
// to the entire project
// export { default } from "next-auth/middleware"

// Applies next-auth only to matching routes - can be regex
// Ref: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
// export const config = { matcher: ["/extra", "/dashboard"] }

// Ref: https://next-auth.js.org/configuration/nextjs#advanced-usage
import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    // `withAuth` augments your `Request` with the user's token.
    function middleware(request: NextRequestWithAuth) {
        /*
            Denied Page:
            - If the user is unauthorized
            - If user is member but requests a page that is not /profile
        */

        if (request.nextauth.token?.role === "unauthorized" || (!request.nextUrl.pathname.startsWith("/profile")
            && request.nextauth.token?.role !== "superadmin"
            && request.nextauth.token?.role !== "admin"
            && request.nextauth.token?.role !== "manager")) {
                return NextResponse.rewrite(
                    new URL("/denied", request.url)
                )
        }

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-pathname", request.nextUrl.pathname);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

// Applies next-auth only to matching routes - can be regex
// Ref: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
// export const config = { matcher: ["/:path*"] }

// Give me regex to match all routes except /denied
export const config = { matcher: '/((?!denied).*)', };
