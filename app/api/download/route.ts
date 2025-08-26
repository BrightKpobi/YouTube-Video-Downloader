import { NextRequest } from "next/server";
import { Readable } from "stream";
import ytdl, { videoFormat } from "ytdl-core";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  const url = rawUrl?.split("&")[0]?.split("?")[0] || "";

  if (!url || !ytdl.validateURL(url)) {
    return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

    const mp4Formats = info.formats.filter(
      (f: videoFormat) => f.container === "mp4" && f.hasVideo && f.hasAudio
    );

    const format = ytdl.chooseFormat(mp4Formats, { quality: "highest" });
    const contentLength = format.contentLength || "0";

    // --- The change is here ---
    // Create the stream but don't convert it to a web stream
    const stream = ytdl(url, { quality: format.itag });

    // Pass the Node.js stream directly to the Response object
    return new Response(stream as any, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${title}.mp4"`,
        "Content-Length": contentLength,
      },
    });
  } catch (error: unknown) {
    console.error("Download error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
