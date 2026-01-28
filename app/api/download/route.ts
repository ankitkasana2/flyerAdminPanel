import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const filename = searchParams.get("filename");

    if (!url) {
        return new NextResponse("URL is required", { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch image");

        const data = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "application/octet-stream";

        const safeFilename = encodeURIComponent(filename || "download");
        return new NextResponse(data, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${filename || "download"}"; filename*=UTF-8''${safeFilename}`,
            },
        });
    } catch (error) {
        console.error("Download proxy error:", error);
        return new NextResponse("Failed to download image", { status: 500 });
    }
}
