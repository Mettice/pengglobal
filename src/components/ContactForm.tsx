"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  submitContactForm,
  type ContactFormState,
} from "@/app/actions/contact";

const INQUIRY_TYPES = ["partnership", "books", "other"] as const;

const inputClass =
  "mt-2 w-full border-2 border-ink bg-paper px-4 py-3 text-ink outline-none transition-colors focus:border-orange";

export default function ContactForm({
  defaultType,
}: {
  defaultType?: string;
}) {
  const t = useTranslations("contact.form");
  const [state, formAction, pending] = useActionState<
    ContactFormState,
    FormData
  >(submitContactForm, { status: "idle" });

  const initialType = INQUIRY_TYPES.includes(
    defaultType as (typeof INQUIRY_TYPES)[number],
  )
    ? defaultType
    : "partnership";

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="border-2 border-lime bg-lime/15 p-7 font-semibold text-ink"
      >
        {t("success")}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-6 border-2 border-ink bg-paper p-6 sm:p-9"
      noValidate={false}
    >
      {/* Honeypot — hidden from real users, tempting for bots */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="kin-mono text-ink">
            {t("name")} <span className="text-orange-deep">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={200}
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="organization"
            className="kin-mono text-ink"
          >
            {t("organization")}{" "}
            <span className="text-ink-faint">({t("optional")})</span>
          </label>
          <input
            id="organization"
            name="organization"
            maxLength={200}
            autoComplete="organization"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="kin-mono text-ink">
            {t("email")} <span className="text-orange-deep">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="kin-mono text-ink">
            {t("phone")}{" "}
            <span className="text-ink-faint">({t("optional")})</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={50}
            autoComplete="tel"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="inquiryType" className="kin-mono text-ink">
          {t("inquiryType")} <span className="text-orange-deep">*</span>
        </label>
        <select
          id="inquiryType"
          name="inquiryType"
          required
          defaultValue={initialType}
          className={inputClass}
        >
          {INQUIRY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`types.${type}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="kin-mono text-ink">
          {t("message")} <span className="text-orange-deep">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          className={inputClass}
        />
      </div>

      {(state.status === "error" || state.status === "invalid") && (
        <p role="alert" className="kin-mono text-red-700">
          {t("error")}
        </p>
      )}
      {state.status === "rateLimited" && (
        <p role="alert" className="kin-mono text-red-700">
          {t("rateLimited")}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="kin-btn disabled:opacity-60"
      >
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
