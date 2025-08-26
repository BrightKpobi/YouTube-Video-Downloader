import { NextRequest } from "next/server";
import ytdl from "ytdl-core";
import { Readable } from "stream";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  // Remove extra params (keep only video ID)
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

    // Filter for mp4 formats with both video and audio
    const mp4Formats = info.formats.filter(
      (f) => f.container === "mp4" && f.hasVideo && f.hasAudio
    );
    const format = ytdl.chooseFormat(mp4Formats, { quality: "highest" });
    const contentLength = format.contentLength || "0";

    // Create a readable stream
    const stream = ytdl(url, { quality: format.itag });

    // Convert Node.js stream to Web ReadableStream for Next.js
    const readableStream = Readable.toWeb(stream);

    return new Response(readableStream, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${title}.mp4"`,
        "Content-Length": contentLength,
      },
    });
  } catch (error: unknown) {
    console.error("Download error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
