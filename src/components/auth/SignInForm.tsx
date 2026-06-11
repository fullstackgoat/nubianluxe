"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

const signInAppearance = {
  variables: {
    colorPrimary: "#C9A84C",
    colorBackground: "#111111",
    colorText: "#F5F0E8",
    colorTextSecondary: "rgba(245,240,232,0.90)",
    colorInputBackground: "rgba(255,255,255,0.07)",
    colorInputText: "#F5F0E8",
    colorNeutral: "#F5F0E8",
    colorTextOnPrimaryBackground: "#0A0A0A",
    borderRadius: "0px",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
  },
  elements: {
    rootBox: "w-full",
    card: "bg-[#111111] border border-[rgba(201,168,76,0.25)] shadow-none rounded-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] rounded-none transition-colors",
    socialButtonsBlockButtonText: "text-ivory font-body font-medium",
    socialButtonsBlockButtonArrow: "text-ivory",
    providerIcon: "brightness-200",
    dividerLine: "bg-[rgba(255,255,255,0.12)]",
    dividerText: "text-ivory/70 font-body text-xs",
    formFieldLabel: "text-ivory/80 font-body text-sm",
    formFieldLabelRow: "text-ivory/80",
    formFieldInput:
      "bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] text-ivory rounded-none focus:border-gold focus:ring-0 font-body placeholder-ivory/30",
    formFieldInputShowPasswordButton: "text-ivory/60 hover:text-ivory",
    formButtonPrimary:
      "bg-gold text-obsidian hover:bg-[#d4b05a] rounded-none font-body font-semibold tracking-widest uppercase text-sm transition-colors",
    footerActionText: "text-ivory/70 font-body",
    footerActionLink: "text-gold hover:text-[#d4b05a] font-body font-medium",
    footerAction: "border-t border-[rgba(255,255,255,0.08)]",
    otpCodeFieldInput:
      "border-[rgba(201,168,76,0.3)] text-ivory bg-[rgba(255,255,255,0.07)]",
    formFieldErrorText: "text-rose-400 font-body",
    alertText: "text-ivory/70 font-body",
    alert: "border-[rgba(201,168,76,0.2)]",
    identityPreviewText: "text-ivory font-body",
    identityPreviewEditButton: "text-gold hover:text-[#d4b05a]",
  },
} as const;

function resolveRedirectUrl(raw: string | null): string {
  if (!raw) return "/account";

  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return "/account";
    if (url.pathname.startsWith("/sign-in")) return "/account";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/account";
  }
}

export default function SignInForm() {
  const searchParams = useSearchParams();
  const redirectUrl = resolveRedirectUrl(searchParams.get("redirect_url"));

  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      fallbackRedirectUrl={redirectUrl}
      forceRedirectUrl={redirectUrl}
      appearance={signInAppearance}
    />
  );
}
