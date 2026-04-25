import { NextRequest, NextResponse } from "next/server";

const FORWARD_HEADERS: HeadersInit = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
  accept: "*/*",
  "accept-language": "en-US,en;q=0.7",
  origin: "https://brightpathsignals.com",
  referer: "https://brightpathsignals.com/",
  "sec-fetch-site": "cross-site",
  "sec-fetch-mode": "cors",
  "sec-fetch-dest": "empty",
  "sec-ch-ua": '"Brave";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-gpc": "1",
  priority: "u=1, i",
};

function resolveUrl(
  line: string,
  baseUrl: string,
  targetOrigin: string,
): string {
  if (line.startsWith("http://") || line.startsWith("https://")) return line;
  if (line.startsWith("/")) return targetOrigin + line;
  const base = baseUrl.substring(0, baseUrl.lastIndexOf("/") + 1);
  return base + line;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams, protocol, host, pathname } = req.nextUrl;
  const qUrl = searchParams.get("url");

  if (!qUrl)
    return NextResponse.json({ error: "Missing ?url=" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(qUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const upstream = await fetch(qUrl, {
    headers: FORWARD_HEADERS,
    redirect: "follow",
    cache: "no-store",
  });

  if (!upstream.ok) {
    const body = await upstream.text();
    return new NextResponse(`Upstream error: ${upstream.status}\n${body}`, {
      status: upstream.status,
    });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  const isM3u8 =
    target.pathname.includes(".m3u8") ||
    contentType.includes("mpegurl") ||
    contentType.includes("x-mpegurl");

  // --- Segment: stream binary as-is ---
  if (!isM3u8) {
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType || "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    });
  }

  // --- M3U8: rewrite all segment/playlist URLs ---
  // const proxyBase = `${protocol}//${host}${pathname}`;
  // let body = await upstream.text();

  // body = body.replace(/^((?!#)\S+)$/gm, (line) => {
  //   line = line.trim();
  //   if (!line) return line;
  //   const absolute = resolveUrl(line, qUrl, target.origin);

  //   // Only proxy nested .m3u8 playlists — segments go direct to origin
  //   if (absolute.includes(".m3u8")) {
  //     return `${proxyBase}?url=${encodeURIComponent(absolute)}`;
  //   }

  //   // Segments bypass your proxy entirely
  //   return absolute;
  // });
  const proxyBase = `${protocol}//${host}${pathname}`;
  let body = await upstream.text();

  body = body.replace(/^((?!#)\S+)$/gm, (line) => {
    line = line.trim();
    if (!line) return line;
    const absolute = resolveUrl(line, qUrl, target.origin);
    return `${proxyBase}?url=${encodeURIComponent(absolute)}`;
  });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}
