"use server";

import { headers } from "next/headers";
import { Resend } from "resend";

export type ContactFormState = {
  status: "idle" | "success" | "error" | "rateLimited" | "invalid";
};

const INQUIRY_TYPES = ["partnership", "books", "other"] as const;
type InquiryType = (typeof INQUIRY_TYPES)[number];

// Conversion tracking (brief §2): submissions are tagged by inquiry type
// in the email subject so "Partnership" and "Books" inquiries are countable.
const SUBJECT_TAGS: Record<InquiryType, string> = {
  partnership: "Partnership",
  books: "Books / Commande de livres",
  other: "Other",
};

// Simple in-memory sliding window: max 3 submissions per IP per 10 minutes.
// Sufficient for a single serverless region; swap for Upstash if traffic grows.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const submissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter(
    (ts) => now - ts < WINDOW_MS,
  );
  if (recent.length >= MAX_PER_WINDOW) {
    submissions.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissions.set(ip, recent);
  return false;
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: real users never fill this hidden field.
  if (formData.get("website")) {
    return { status: "success" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const inquiryType = String(formData.get("inquiryType") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (
    !name ||
    !message ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !INQUIRY_TYPES.includes(inquiryType as InquiryType) ||
    name.length > 200 ||
    email.length > 200 ||
    message.length > 5000
  ) {
    return { status: "invalid" };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return { status: "rateLimited" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL ?? "contact-form@penglobalholding.com";

  if (!apiKey || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[contact] RESEND not configured; would send:", {
        name,
        organization,
        email,
        phone,
        inquiryType,
        message,
      });
      return { status: "success" };
    }
    console.error("[contact] RESEND_API_KEY / CONTACT_TO_EMAIL not set");
    return { status: "error" };
  }

  try {
    const resend = new Resend(apiKey);
    const tag = SUBJECT_TAGS[inquiryType as InquiryType];
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[${tag}] Website inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Organization: ${organization || "—"}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        `Inquiry type: ${tag}`,
        "",
        message,
      ].join("\n"),
    });
    if (error) {
      console.error("[contact] Resend error:", error);
      return { status: "error" };
    }
    return { status: "success" };
  } catch (err) {
    console.error("[contact] send failed:", err);
    return { status: "error" };
  }
}
