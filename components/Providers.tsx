// app/components/Providers.tsx
"use client";

import React, { ReactNode } from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

interface Props {
  children: ReactNode;
  session: Session | null;
}

const Providers = ({ children, session }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;