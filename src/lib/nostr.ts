// lib/nostr.ts
import { finalizeEvent, getPublicKey, SimplePool, type Event } from "nostr-tools";
import type { EventTemplate } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

const RELAYS = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.snort.social", "wss://relay.nostr.band"];

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: any) => Promise<Event>;
    };
  }
}

export async function createAndSignEvent({
  kind,
  content,
  tags,
  sk,
}: {
  kind: number;
  content: string;
  tags: string[][];
  sk: string | null; // hex string
}): Promise<Event> {
  const created_at = Math.floor(Date.now() / 1000);

  const eventTemplate: EventTemplate = {
    kind,
    created_at,
    tags,
    content,
  };

  if (sk) {
    const skBytes = hexToBytes(sk);
    return finalizeEvent(eventTemplate, skBytes);
  }

  if (!window.nostr) throw new Error("Nostr extension not found");
  return await window.nostr.signEvent(eventTemplate);
}

export async function publishEvent(event: Event, relays: string[] = RELAYS): Promise<void> {
  const pool = new SimplePool();

  const pubs = pool.publish(relays, event);

  if (!pubs) {
    throw new Error("Failed to publish event");
  }

  for await (const relay of pubs) {
    console.log(`✅ Event published to ${relay}`);
  }

  pool.close(relays);
}
