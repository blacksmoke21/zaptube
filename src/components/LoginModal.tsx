"use client";
import { useState } from "react";
import { loginWithExtension, loginWithPrivateKey, generateNewKeypair } from "@/lib/auth";

export default function LoginModal({ onLogin }: { onLogin: (pk: string, sk?: string) => void }) {
  const [show, setShow] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [bunkerUrl, setBunkerUrl] = useState("");

  const handlePrivateKeyLogin = () => {
    try {
      const pubkey = loginWithPrivateKey(privateKey);
      onLogin(pubkey, privateKey);
      setShow(false);
    } catch {
      alert("Invalid private key");
    }
  };

  const handleNewAccount = () => {
    const { skHex, pkHex, skNsec, pkNpub } = generateNewKeypair();
    onLogin(pkHex, skHex);

    alert(
      `✅ Account created!\n\n🔑 Your Nostr private key (nsec):\n${skNsec}\n\n📬 Public key (npub):\n${pkNpub}\n\n⚠️ Save this somewhere safe.`
    );

    setShow(false);
  };

  return (
    <>
      <button onClick={() => setShow(true)} className="text-sm px-4 py-2 rounded bg-purple-600 text-white">
        Login
      </button>

      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg w-80 space-y-4">
            <h2 className="text-white text-lg font-semibold">Login with Nostr</h2>

            <button
              onClick={async () => {
                const pk = await loginWithExtension();
                if (pk) {
                  onLogin(pk);
                  setShow(false);
                } else {
                  alert("Extension not found or failed");
                }
              }}
              className="w-full px-4 py-2 rounded bg-yellow-500 text-black"
            >
              Login with Extension
            </button>

            <div className="space-y-2">
              <input
                type="text"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Private key"
                className="w-full px-3 py-2 rounded bg-gray-800 text-white text-sm"
              />
              <button onClick={handlePrivateKeyLogin} className="w-full px-4 py-2 rounded bg-blue-600 text-white">
                Login with Private Key
              </button>
            </div>

            {/* Placeholder for bunker url */}
            <input
              type="text"
              value={bunkerUrl}
              onChange={(e) => setBunkerUrl(e.target.value)}
              placeholder="Bunker URL (not implemented)"
              className="w-full px-3 py-2 rounded bg-gray-800 text-white text-sm"
            />

            <button onClick={handleNewAccount} className="w-full px-4 py-2 rounded bg-green-600 text-white">
              Create New Account
            </button>

            <button onClick={() => setShow(false)} className="w-full text-sm text-gray-400 hover:underline">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
