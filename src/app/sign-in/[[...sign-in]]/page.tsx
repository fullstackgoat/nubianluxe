import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import SignInForm from "@/components/auth/SignInForm";

export const metadata = {
  title: "Sign In | Nubian Luxe",
};

type PageProps = {
  params: Promise<{ "sign-in"?: string[] }>;
  searchParams: Promise<{ redirect_url?: string }>;
};

function safeRedirectPath(raw: string | undefined): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/account";
  if (raw.startsWith("/sign-in")) return "/account";
  return raw;
}

export default async function SignInPage({ params, searchParams }: PageProps) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const segments = resolvedParams["sign-in"] ?? [];

  if (segments[0] === "admin") {
    redirect(`/sign-in?redirect_url=${encodeURIComponent("/admin")}`);
  }

  const redirectPath = safeRedirectPath(resolvedSearchParams.redirect_url);

  if (userId) {
    redirect(redirectPath);
  }

  return (
    <main className="min-h-screen bg-obsidian">
      <Navigation />
      <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <p className="font-accent text-gold text-sm tracking-[0.3em] uppercase mb-3">
              Welcome Back
            </p>
            <h1 className="font-display text-4xl text-ivory font-light italic">
              Sign In
            </h1>
            <div className="gold-divider mt-4 mx-auto" />
          </div>

          <Suspense
            fallback={
              <div className="glass-card p-8 text-center">
                <p className="text-ivory/40 font-body text-sm">Loading sign in…</p>
              </div>
            }
          >
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
