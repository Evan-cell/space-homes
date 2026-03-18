import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/about(.*)",
    "/contact(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();

    // 1. If user is signed in and on the homepage, redirect to their role-based page
    if (userId && req.nextUrl.pathname === "/") {
        const role = (sessionClaims?.metadata as { role?: string })?.role;
        if (role === "landlord") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        } else if (role === "tenant") {
            return NextResponse.redirect(new URL("/listings", req.url));
        }
    }

    // 1.1 If user is signed in and on the onboarding page, but ALREADY has a role, redirect them
    if (userId && isOnboardingRoute(req)) {
        const role = (sessionClaims?.metadata as { role?: string })?.role;
        if (role === "landlord") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        } else if (role === "tenant") {
            return NextResponse.redirect(new URL("/listings", req.url));
        }
    }

    // 2. Protect routes except public ones
    // Note: We don't use auth.protect() here because we want custom redirection logic below.
    if (!userId && !isPublicRoute(req)) {
        return (await auth()).redirectToSignIn();
    }

    // 3. Enforce onboarding for signed-in users without a role
    if (userId && !isPublicRoute(req) && !isOnboardingRoute(req)) {
        const role = (sessionClaims?.metadata as { role?: string })?.role;
        
        if (!role) {
            // Avoid stale session loop: If the user is going to a page that fetches 
            // fresh user data (like /dashboard), let that page handle the redirect.
            const isFreshCheckPage = req.nextUrl.pathname.startsWith("/dashboard") || 
                                    req.nextUrl.pathname.startsWith("/listings");
            
            if (!isFreshCheckPage) {
                return NextResponse.redirect(new URL("/onboarding", req.url));
            }
        }
    }

    // 4. Restrict landlord from accessing listings (as requested)
    if (userId && req.nextUrl.pathname.startsWith("/listings")) {
        const role = (sessionClaims?.metadata as { role?: string })?.role;
        if (role === "landlord") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
