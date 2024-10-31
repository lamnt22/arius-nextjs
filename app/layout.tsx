// These styles apply to every route in the application

import Toaster from "@/components/toaster";
import SideBar from "@/components/sidebar";
import "@/styles/globals.css";
import "@/styles/pagination.css";

import { getServerSession } from "next-auth/next";
import Login from "./login/page";

import Providers from "../components/Providers";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    loginUserEmail: string,
    loginUserRole: string,
    loginEmployee: string
  };
}) {

  function objToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return keyValuePairs.join('&');
  }

  const getRoleByEmail = async (email: string) => {
    const queryString = objToQueryString({
      email
    });

    let res = await fetch(`http://127.0.0.1:3000/api/user/getRole?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    let data = await res.json();
    params.loginUserRole = data.getRoleUser;
    params.loginEmployee = data.getEmployeeId as string;
  }

  const session = await getServerSession();

  params.loginUserEmail = session?.user?.email as string;

  if(params.loginUserEmail != null){
    if (!params.hasOwnProperty('loginUserRole') || params.loginUserRole == "" || params.hasOwnProperty('loginEmployee') || params.loginEmployee == "") {
      await getRoleByEmail(params.loginUserEmail);
    }
  }
  return (
    <html lang="en">
      <body className={`overflow-hidden`}>

        { 
          session ? (
            <>
              <Toaster toastOptions={{
                  className: '',
                  style: {
                    maxWidth: 500
                  },
                }}
              />
              <Providers session={session}>
                <div className="flex justify-between">
                    <div className="relative child"><SideBar userRole={params.loginUserRole}/></div>
                    <div className="relative w-full h-screen p-7">{children}</div>
                </div>
              </Providers>
            </>
          ) : (
            <Login />
          )
        }
      </body>
    </html>
  );
}
