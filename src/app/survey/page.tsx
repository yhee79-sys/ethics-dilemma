import type { Metadata } from "next";
import Link from "next/link";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { SITE_NAME } from "@/lib/constants";
import { getSurveyDilemmas } from "@/lib/dilemmas";

export const metadata: Metadata = { title: `설문 참여 | ${SITE_NAME}` };

export default async function SurveyPage() {
  const dilemmas = await getSurveyDilemmas();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-6">
      <Link href="/" className="mb-6 inline-block text-base text-muted hover:underline">
        ← 처음으로
      </Link>
      <SurveyForm dilemmas={dilemmas} />
    </main>
  );
}
