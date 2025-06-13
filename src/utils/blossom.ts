export async function uploadToBlossom(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("https://your-blossom-server.com/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${text}`);
    }

    const data = await res.json();
    return data.url || data.cid || "";
  } catch (err) {
    console.error("Blossom upload failed", err);
    throw err;
  }
}
