import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

type WebhookOperation = "create" | "update" | "delete";

type WebhookPayload = {
  _id?: unknown;
  _type?: unknown;
  operation?: unknown;
};

// Single-page site: every document type maps to a fixed set of cache tags.
// "layout" = header/footer/settings (fetched on every page), "home" = home page sections.
const tagsByType: Record<string, string[]> = {
  siteSettings: ["layout", "home"],
  navigation: ["layout"],
  homePage: ["home"],
  pricingPlan: ["home"],
  review: ["home"],
  faq: ["home"],
  announcement: ["layout"],
};

function readOperation(value: unknown): WebhookOperation | undefined {
  return value === "create" || value === "update" || value === "delete"
    ? value
    : undefined;
}

export async function POST(req: Request) {
  const signature = req.headers.get("sanity-webhook-signature");
  if (!signature) {
    return NextResponse.json(
      { message: "No signature provided" },
      { status: 401 }
    );
  }

  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("SANITY_WEBHOOK_SECRET is not set in environment variables");
    return NextResponse.json(
      { message: "Server misconfiguration: missing secret" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const { isValidSignature } = await import("@sanity/webhook");

  try {
    if (!(await isValidSignature(body, signature, secret))) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.warn("Invalid Sanity webhook signature", error);
    return NextResponse.json(
      { message: "Invalid signature" },
      { status: 401 }
    );
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(body) as WebhookPayload;
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const documentId = typeof payload._id === "string" ? payload._id : undefined;
  const documentType = typeof payload._type === "string" ? payload._type : undefined;
  const operation = readOperation(payload.operation);

  if (documentId?.startsWith("drafts.")) {
    return NextResponse.json({
      revalidated: false,
      message: "Skipped draft document",
    });
  }

  if (!documentType || !operation) {
    return NextResponse.json(
      {
        message:
          "Invalid webhook payload. Configure the documented Sanity webhook projection.",
      },
      { status: 400 }
    );
  }

  const tags = tagsByType[documentType] ?? [];
  if (tags.length === 0) {
    return NextResponse.json({
      revalidated: false,
      message: `No cache tags configured for ${documentType}`,
    });
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  console.log("[Sanity Webhook] Revalidated", {
    documentType,
    operation,
    tags,
  });

  return NextResponse.json({
    revalidated: true,
    documentType,
    operation,
    tags,
    now: Date.now(),
  });
}
