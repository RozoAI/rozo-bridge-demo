import { getDocData } from "@/lib/docs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FAQPage() {
  let docData;

  try {
    docData = await getDocData("FAQs");
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div
            className="privacy-policy-content"
            dangerouslySetInnerHTML={{ __html: docData.contentHtml }}
          />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: "FAQ - Rozo Bridge",
    description: "Rozo Bridge FAQ - Frequently asked questions.",
  };
}
