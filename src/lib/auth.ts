import { nip19 } from "nostr-tools";
import { generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { bytesToHex, hexToBytes } from "nostr-tools/utils";

export function generateNewKeypair() {
  const skBytes = generateSecretKey();
  const skHex = bytesToHex(skBytes);
  const pkHex = getPublicKey(skBytes);
  const skNsec = nip19.nsecEncode(skBytes);
  const pkNpub = nip19.npubEncode(pkHex);
  return { skHex, pkHex, skNsec, pkNpub };
}

export async function loginWithExtension(): Promise<string | null> {
  if (!window.nostr) return null;
  try {
    return await window.nostr.getPublicKey();
  } catch {
    return null;
  }
}

export function loginWithPrivateKey(sk: string): string {
  if (!/^([0-9a-f]{64})$/i.test(sk)) {
    throw new Error("Invalid private key format");
  }
  const skBytes = hexToBytes(sk);
  return getPublicKey(skBytes);
}

export function logout() {
  localStorage.removeItem("nostr-auth");
}
