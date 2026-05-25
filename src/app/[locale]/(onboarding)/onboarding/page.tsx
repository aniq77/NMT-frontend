import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Налаштування",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
