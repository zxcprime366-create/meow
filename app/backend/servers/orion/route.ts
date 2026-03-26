import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { NextRequest, NextResponse } from "next/server";
import { validateBackendToken } from "@/lib/validate-token";
import { isValidReferer } from "@/lib/allowed-referers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_HOLLY_SUPABASE_URL_HOLLY!,
  process.env.HOLLY_SUPABASE_SERVICE_ROLE_KEY_HOLLY!,
);

async function dbGet(
  tmdbId: string,
  mediaType: string,
  season: string | null,
  episode: string | null,
) {
  try {
    let query = supabase
      .from("holly_cache")
      .select("qualities")
      .eq("tmdb_id", Number(tmdbId))
      .eq("media_type", mediaType);

    if (season) query = query.eq("season", Number(season));
    else query = query.is("season", null);

    if (episode) query = query.eq("episode", Number(episode));
    else query = query.is("episode", null);

    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;
    return data.qualities as Array<{ quality: string; embed_url: string }>;
  } catch {
    return null;
  }
}

async function dbSave(
  tmdbId: string,
  mediaType: string,
  season: string | null,
  episode: string | null,
  qualities: Array<{ quality: string; embed_url: string }>,
) {
  try {
    const { error } = await supabase.from("holly_cache").upsert(
      {
        tmdb_id: Number(tmdbId),
        media_type: mediaType,
        season: season ? Number(season) : null,
        episode: episode ? Number(episode) : null,
        qualities,
      },
      { onConflict: "tmdb_id,media_type,season,episode" },
    );
    if (error) console.warn("[holly dbSave] error:", error);
  } catch (err: any) {
    console.warn("[holly dbSave] exception:", err.message);
  }
}

export async function GET(req: NextRequest) {
  try {
    const tmdbId = req.nextUrl.searchParams.get("a");
    const mediaType = req.nextUrl.searchParams.get("b");
    const season = req.nextUrl.searchParams.get("c");
    const episode = req.nextUrl.searchParams.get("d");
    const title = req.nextUrl.searchParams.get("f");
    const year = req.nextUrl.searchParams.get("g");
    const ts = Number(req.nextUrl.searchParams.get("gago"));
    const token = req.nextUrl.searchParams.get("putangnamo")!;
    const f_token = req.nextUrl.searchParams.get("f_token")!;

    if (!tmdbId || !mediaType || !title || !year || !ts || !token) {
      return NextResponse.json(
        { success: false, error: "need token" },
        { status: 404 },
      );
    }

    if (Date.now() - Number(ts) > 8000) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 403 },
      );
    }

    if (!validateBackendToken(tmdbId, f_token, ts, token)) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 403 },
      );
    }

    const referer = req.headers.get("referer") || "";
    if (!isValidReferer(referer)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // ─── STEP 1: Check cache, else fetch Holly metadata ───────────────────────
    let qualities: Array<{ quality: string; embed_url: string }>;

    const cached = await dbGet(tmdbId, mediaType, season, episode);

    if (cached) {
      qualities = cached;
    } else {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const hollySlug =
        mediaType === "tv" && season && episode
          ? `${baseSlug}-season-${season}-episode-${episode}`
          : `${baseSlug}-${year}`;

      const step1Url = `https://still-pond-16b9.orbitprime27.workers.dev/?slug=${encodeURIComponent(hollySlug)}`;

      const step1Res = await fetchWithTimeout(step1Url, {}, 6000);
      if (!step1Res.ok) {
        return NextResponse.json(
          {
            success: false,
            error: "Holly step 1 failed",
            status: step1Res.status,
          },
          { status: step1Res.status },
        );
      }

      const step1Data = await step1Res.json();
      qualities = step1Data.qualities ?? [];

      if (!qualities.length) {
        return NextResponse.json(
          { success: false, error: "No qualities found from Holly" },
          { status: 404 },
        );
      }

      // fire-and-forget
      dbSave(tmdbId, mediaType, season, episode, qualities).catch((e: any) =>
        console.warn("[holly dbSave] failed:", e.message),
      );
    }

    // ─── STEP 2: Pick best quality → resolve embed ────────────────────────────
    const bestQuality =
      qualities.find((q) => q.quality === "1080p") ??
      qualities.find((q) => q.quality === "default") ??
      qualities[0];

    const embedUrl = bestQuality.embed_url;

    const step2Url = `https://ancient-wood-1bb5.orbitprime27.workers.dev/?embed_url=${encodeURIComponent(embedUrl)}`;

    const step2Res = await fetchWithTimeout(step2Url, {}, 6000);
    if (!step2Res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Holly step 2 failed",
          status: step2Res.status,
        },
        { status: step2Res.status },
      );
    }

    const step2Data = await step2Res.json();
    const sources: Array<{ label: string; type: string; file: string }> =
      step2Data.sources ?? [];

    if (!sources.length) {
      return NextResponse.json(
        { success: false, error: "No sources from Holly step 2" },
        { status: 404 },
      );
    }

    const hlsSource =
      sources.find((s) => s.type === "mp4") ??
      sources.find((s) => s.type === "hls" && s.label === "LS-25") ??
      sources.find((s) => s.type === "hls");

    if (!hlsSource) {
      return NextResponse.json(
        { success: false, error: "No usable source found" },
        { status: 404 },
      );
    }

    // ─── STEP 3: Proxy the stream URL ─────────────────────────────────────────
    const proxiedUrl = `https://rapid-bonus-e527.orbitprime27.workers.dev/?url=${encodeURIComponent(hlsSource.file)}`;

    const proxyCheck = await fetchWithTimeout(
      proxiedUrl,
      { method: "GET", headers: { Range: "bytes=0-1" } },
      5000,
    ).catch(() => null);

    if (!proxyCheck?.ok) {
      return NextResponse.json(
        { success: false, error: "Holly proxy check failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      c: !!cached,
      links: [
        {
          type: hlsSource.type === "hls" ? "hls" : "mp4",
          link: proxiedUrl,
        },
      ],
      subtitles: [],
    });
  } catch (err) {
    console.error("Holly route error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
