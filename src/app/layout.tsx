"use client";
import type { Metadata } from "next";
import { ethers } from "ethers";

import localFont from "next/font/local";
import "./globals.css";
import {
  ChainId,
  ThirdwebProvider,
  ThirdwebSDKProvider,
} from "@thirdweb-dev/react";
import { access } from "fs";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientId = process.env.NEXT_PUBLIC_THIRD_WEB_CLIENT_ID;
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThirdwebProvider clientId={clientId} activeChain={"sepolia"}>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}
