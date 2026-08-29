/**
 * IndexNow Instant Search Engine Indexing
 * Pings Bing, Yandex, Seznam, and partner search engines for instant indexing
 */

export async function pingIndexNow(urls: string[]): Promise<boolean> {
  if (!urls.length) return false;

  try {
    const host = new URL(urls[0]).host;
    const key = process.env.INDEXNOW_KEY || "8f7b2a9e3d4c1b5a6f8e7d9c2b4a1f3e";

    const payload = {
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: urls,
    };

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    return res.ok || res.status === 202;
  } catch (err) {
    console.warn("IndexNow ping failed:", err);
    return false;
  }
}
