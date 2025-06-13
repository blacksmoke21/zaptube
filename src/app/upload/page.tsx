"use client";

import { useState } from "react";
import { createAndSignEvent, publishEvent } from "@/utils/nostr";
import { useRouter } from "next/navigation";
// import { uploadToBlossom } from "@/lib/blossom";
// import { hexToBytes } from "nostr-tools/utils";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleUpload = async () => {
    if (!file || !title) {
      alert("Please select a video and enter a title.");
      return;
    }

    try {
      setUploading(true);

      // const url = await uploadToBlossom(file);
      
      // TODO: Replace with actual upload logic
      const dummyUploadResponse = {
        sha256: "d6617a009c0c6c9aebf7398d43cad6d1985ddc1b9ab0479e2ea977362b8af5b0",
        size: 17839845,
        uploaded: 1749492223,
        type: "video/mp4",
        url: "https://cdn.azzamo.net/d6617a009c0c6c9aebf7398d43cad6d1985ddc1b9ab0479e2ea977362b8af5b0.mp4",
      };
      const url = dummyUploadResponse.url;

      const newEvent = {
        content: description,
        kind: 34235,
        tags: [
          ["title", title],
          ["imeta", `url ${url}`],
          ["client", "Zaptube-Web"],
        ],
      };

      let hashtags: string[][] = [];
      if (tags !== "") {
        hashtags = tags.split(",").map((tag) => ["t", tag.trim()]);
      }

      if (hashtags.length > 0) {
        newEvent.tags.push(...hashtags);
      }

      const authDetails = localStorage.getItem("nostr-auth");
      if (!authDetails) {
        alert("You must be logged in to upload a video.");
        return;
      }
      const sk = JSON.parse(authDetails).privkey;
      console.log("Event data:", newEvent);
      
      const event = await createAndSignEvent({ ...newEvent, sk });
      console.log("Event created:", event);

      // You should also publish the event here
      const publish = await publishEvent(event);
      console.log("Event published:", publish);

      setShowPopup(true);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-gray-900 text-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Upload New Video</h1>

      <label className="block mb-4">
        <span className="text-sm text-gray-300">Video File</span>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full border border-gray-700 rounded p-2 bg-gray-800 text-white"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-gray-300">Title</span>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-700 rounded p-2 bg-gray-800 text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-gray-300">Description</span>
        <textarea
          className="mt-1 block w-full border border-gray-700 rounded p-2 bg-gray-800 text-white"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className="block mb-6">
        <span className="text-sm text-gray-300">Tags (comma-separated)</span>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-700 rounded p-2 bg-gray-800 text-white"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        {uploading ? "Uploading..." : "Upload Video"}
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-md max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-2">✅ Upload Successful</h2>
            <p className="text-gray-300 mb-4">Your video has been uploaded and posted to Nostr.</p>
            <button
              onClick={() => {
                setShowPopup(false);
                router.push("/");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
