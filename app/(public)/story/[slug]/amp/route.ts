import { NextRequest, NextResponse } from "next/server";
import { GET as getAmpStory } from "@/app/api/stories/[id]/amp/route";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  return getAmpStory(req, { params: Promise.resolve({ id: slug }) });
}
