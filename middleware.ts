import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard)
  const path = req.nextUrl.pathname;

  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const token :any= await getToken({req});
  const userRole =token?.user?.role;

  const authPathUser = [
    "/member",
    "/finance/overview",
    "/finance/expense",
    "/finance/income",
    "/user",
    "/customer",
    "/expensebudget",
    "/holiday",
    "/masterdata",
    "/project",
    "/project/resource-allocation",
    "/salary",
  ]

  const authPathManager = [
    "/finance/overview",
    "/finance/expense",
    "/finance/income",
    "/user",
    "/customer",
    "/expensebudget",
    "/holiday",
    "/masterdata",
    "/salary",
  ]
  
  // If it's the root path, just render it
  if (path === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (userRole === "USER" && authPathUser.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } else if (userRole === "MANAGER" && authPathManager.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } else if (session && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL(path, req.url));
  }

  return NextResponse.next();
}
