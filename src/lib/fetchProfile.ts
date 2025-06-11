// lib/fetchProfile.ts
import { SimplePool } from "nostr-tools/pool";

type Profile = {
  name: string;
  picture: string;
};

const profileCache = new Map<string, Profile>();

export async function fetchProfile(pubkey: string): Promise<Profile> {
  if (profileCache.has(pubkey)) {
    return profileCache.get(pubkey)!;
  }

  const pool = new SimplePool();

  return new Promise((resolve) => {
    const sub = pool.subscribeMany(
      ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.snort.social", "wss://relay.nostr.band"],
      [{ kinds: [0], authors: [pubkey], limit: 1 }],
      {
        onevent(event) {
          try {
            const metadata = JSON.parse(event.content);
            const profile = {
              name: metadata.name || pubkey.slice(0, 12),
              picture: metadata.picture || "",
            };
            profileCache.set(pubkey, profile);
            resolve(profile);
          } catch {
            resolve({ name: pubkey.slice(0, 12), picture: "" });
          }
        },
        oneose() {
          resolve({ name: pubkey.slice(0, 12), picture: "" });
        },
      }
    );

    setTimeout(() => {
      sub.close();
      resolve({ name: pubkey.slice(0, 12), picture: "" });
    }, 5000);
  });
}
