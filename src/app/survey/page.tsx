import type { Metadata } from "next";
import Link from "next/link";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { getSurveyDilemmas } from "@/lib/dilemmas";

export const metadata: Metadata = { title: "설문 참여 | 윤리 딜레마 설문" };

export default async function SurveyPage() {
  const dilemmas = await getSurveyDilemmas();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-6">
      <Link href="/" className="mb-6 inline-block text-base text-zinc-500 hover:underline dark:text-zinc-400">
        ← 처음으로
      </Link>
      <SurveyForm dilemmas={dilemmas} />
    </main>
  );
}
