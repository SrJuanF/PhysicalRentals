"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Wallet, Home, Plus } from "lucide-react";

export default function Header() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">Physical Artifact Rentals</h1>
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:text-gray-300 transition-colors"
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link
            href="/create-tool"
            className="flex items-center space-x-2 hover:text-gray-300 transition-colors"
          >
            <Plus size={20} />
            <span>Create Tool</span>
          </Link>
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </div>
    </nav>
  );
}
