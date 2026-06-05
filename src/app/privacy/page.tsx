import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Qwintly - Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <div className="h-px bg-stone-200 dark:bg-stone-800/80 w-full" />
          </div>

          {/* Content */}
          <div className="space-y-6 text-stone-700 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">1. Introduction</h2>
              <p>
                Welcome to Qwintly (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application located at qwintly.com and dev.qwintly.com.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">2. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us when creating an account, describing application requirements, and using our chat features:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Information:</strong> Name, email address, profile picture, and authentication credentials.</li>
                <li><strong>Application Data:</strong> The prompts, descriptions, and specifications you submit to generate applications.</li>
                <li><strong>Usage Data:</strong> Technical logs, device type, browser information, IP address, and details on how you interact with our service.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">3. How We Use Your Information</h2>
              <p>
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide, maintain, and improve our AI-powered app generation services.</li>
                <li>To authenticate your identity and manage your user account.</li>
                <li>To analyze usage patterns to enhance the quality of generated applications and developer workflows.</li>
                <li>To communicate with you regarding updates, technical notices, and support inquiries.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">4. Sharing Your Information</h2>
              <p>
                We do not sell your personal information. We may share your data with trusted third-party providers under strict data protection agreements:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>AI Service Providers:</strong> Prompts may be sent to Google Gemini APIs to generate code and designs.</li>
                <li><strong>Cloud Infrastructure Providers:</strong> Hosting and storage services (Google Cloud Platform, Supabase, Upstash Redis).</li>
                <li><strong>Analytics Services:</strong> Tools like Google Analytics to understand website traffic.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">5. Data Security</h2>
              <p>
                We implement robust security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, please remember that no method of transmission over the internet or method of electronic storage is 100% secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">6. Your Rights</h2>
              <p>
                Depending on your location, you may have rights under regulations like GDPR or CCPA to access, correct, delete, or limit the use of your personal data. Please contact us if you wish to exercise these rights.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">7. Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">8. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy, please reach out to us at <a href="mailto:support@qwintly.com" className="text-teal-600 dark:text-teal-400 hover:underline">support@qwintly.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
