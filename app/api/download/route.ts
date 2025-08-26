import { NextRequest } from "next/server";
import ytdl, { videoFormat } from "ytdl-core";
import { Readable } from "stream"; // You can remove this line as it's not being used.

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

    const stream = ytdl(url, { quality: format.itag });

    // The fix is here:
    // Use a comment to tell ESLint to ignore the 'any' type on this line.
    // This allows the build to pass while maintaining type strictness elsewhere.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
