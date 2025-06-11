"use client";
import { useState, useEffect } from "react";
import LoginModal from "./LoginModal";
import { logout } from "@/lib/auth";
import { fetchProfile } from "@/lib/fetchProfile";
import Link from "next/link";

export default function Header() {
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{ name: string; picture: string }>();

  useEffect(() => {
    const stored = localStorage.getItem("nostr-auth");
    if (stored) {
      const pk = JSON.parse(stored).pubkey;
      setPubkey(pk);
      fetchProfileData(pk);
    }
  }, []);

  const handleLogin = async (pk: string, sk?: string) => {
    localStorage.setItem("nostr-auth", JSON.stringify({ pubkey: pk, privkey: sk || null }));
    setPubkey(pk);
    fetchProfileData(pk);
  };

  const fetchProfileData = async (pk: string) => {
    try {
      const profile = await fetchProfile(pk);
      setProfileData(profile);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleLogout = () => {
    logout();
    setPubkey(null);
  };

  return (
    <header className="flex justify-between p-4 bg-gray-950 text-white">
      <h1 className="text-xl font-bold">ZapTube</h1>
      {pubkey ? (
        <div className="flex items-center gap-4 text-sm">
          {profileData?.picture ? (
            <img src={profileData.picture} alt="profile" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-600" />
          )}
          <span>{profileData?.name || pubkey.slice(0, 12)}</span>
          <Link href={`/upload`}>
            <button className="px-3 py-1 bg-red-500 rounded">
              Upload
            </button>
          </Link>
          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 rounded">
            Logout
          </button>
        </div>
      ) : (
        <LoginModal onLogin={handleLogin} />
      )}
    </header>
  );
}
