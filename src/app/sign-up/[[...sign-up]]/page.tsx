import { SignUp } from "@clerk/nextjs";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Create Account | Nubian Luxe",
};

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-obsidian">
      <Navigation />
      <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <p className="font-accent text-gold text-sm tracking-[0.3em] uppercase mb-3">
              Join the Experience
            </p>
            <h1 className="font-display text-4xl text-ivory font-light italic">
              Create Account
            </h1>
            <div className="gold-divider mt-4 mx-auto" />
            <p className="mt-4 text-ivory/50 font-body text-sm">
              Track your bookings and manage your appointments
            </p>
          </div>
          <SignUp
            appearance={{
              variables: {
                colorPrimary:        "#C9A84C",
                colorBackground:     "#111111",
                colorText:           "#F5F0E8",
                colorTextSecondary:  "rgba(245,240,232,0.90)",
                colorInputBackground:"rgba(255,255,255,0.07)",
                colorInputText:      "#F5F0E8",
                colorNeutral:        "#F5F0E8",
                colorTextOnPrimaryBackground: "#0A0A0A",
                borderRadius:        "0px",
                fontFamily:          "var(--font-body)",
                fontSize:            "14px",
              },
              elements: {
                rootBox: "w-full",
                card: "bg-[#111111] border border-[rgba(201,168,76,0.25)] shadow-none rounded-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",

                socialButtonsBlockButton:
                  "border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] rounded-none transition-colors",
                socialButtonsBlockButtonText:
                  "text-ivory font-body font-medium",
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

                otpCodeFieldInput: "border-[rgba(201,168,76,0.3)] text-ivory bg-[rgba(255,255,255,0.07)]",
                formFieldErrorText: "text-rose-400 font-body",
                alertText: "text-ivory/70 font-body",
                alert: "border-[rgba(201,168,76,0.2)]",
                identityPreviewText: "text-ivory font-body",
                identityPreviewEditButton: "text-gold hover:text-[#d4b05a]",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
