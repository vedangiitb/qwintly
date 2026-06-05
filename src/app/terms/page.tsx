import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Qwintly - Read about the terms and rules of using our platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="w-full flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar bg-transparent">
      <main className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/" passHref>
              <Button
                variant="ghost"
                className="text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-900/5 dark:hover:bg-white/5 cursor-pointer rounded-full h-9 px-3 text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Page Header */}
          <div className="space-y-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
              Terms of Service
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <div className="h-px bg-stone-200 dark:bg-stone-800/80 w-full" />
          </div>

          {/* Content */}
          <div className="space-y-6 text-stone-700 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">1. Agreement to Terms</h2>
              <p>
                By accessing or using Qwintly ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">2. Description of Service</h2>
              <p>
                Qwintly is an AI-powered application generation platform. We allow users to write natural language prompts and automatically receive generated source code, designs, and deployment configurations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">3. Accounts and Registration</h2>
              <p>
                To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your account password and for any activities or actions under your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">4. Intellectual Property and Generated Code</h2>
              <p>
                <strong>Ownership of Generated Code:</strong> You own all source code and assets generated specifically for you by Qwintly, subject to your compliance with these Terms. You are free to export, deploy, modify, and monetize the generated application code as your own.
              </p>
              <p>
                <strong>Our Intellectual Property:</strong> Qwintly, including the brand, platform codebase, AI prompt engineering models, and underlying system designs, remains the exclusive property of Qwintly and its licensors.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">5. Acceptable Use and Restrictions</h2>
              <p>
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Generate software intended to harm, exploit, or spam users, or violate local laws.</li>
                <li>Attempt to bypass rate limits, probe, scan, or test the vulnerability of our network or system.</li>
                <li>Decompile, disassemble, or reverse engineer the core Qwintly generation engine.</li>
                <li>Use automated bots or scripts to scrape data or register mass accounts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">6. Third-Party Services</h2>
              <p>
                Our platform interacts with third-party APIs (such as Google Gemini, GitHub, Supabase). You acknowledge that your use of the Service is also governed by the terms and policies of these third-party providers. We are not responsible for any issues arising from third-party outages or service changes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">7. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT GENERATED CODE IS COMPLETELY ERROR-FREE, SECURE, OR SUITABLE FOR ANY SPECIFIC BUSINESS PURPOSE.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">8. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, QWINTLY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">9. Termination</h2>
              <p>
                We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">10. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at <a href="mailto:support@qwintly.com" className="text-teal-600 dark:text-teal-400 hover:underline">support@qwintly.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
