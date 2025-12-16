import { NextResponse } from "next/server";
import { searchArticles } from "../../../lib/wiki";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const results = await searchArticles(q);
  return NextResponse.json(results);
}
