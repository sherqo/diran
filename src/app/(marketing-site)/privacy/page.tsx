import { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';

export const metadata: Metadata = generateSEO({
    title: 'Privacy Policy - Diran AI',
    description:
        "Learn how Diran AI protects your privacy and handles your data. We don't sell your data and you control all integrations.",
    canonical: '/privacy',
    noIndex: false,
});

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <h1 className="text-5xl font-medium font-clash text-primary mb-2">
                    Privacy Policy
                </h1>
                <p className="text-gray-600 mb-12">
                    Last updated: 25 July 2025
                </p>

                <div className="prose prose-lg max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            1. What We Collect
                        </h2>
                        <p className="text-gray-700 mb-4">
                            We may collect and process the following
                            information:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>
                                <strong>Basic info:</strong> Your name and email
                                (via Google sign-in)
                            </li>
                            <li>
                                <strong>Health data:</strong> Sleep, fitness,
                                and stress signals from tools like Apple Health
                                or Google Fit
                            </li>
                            <li>
                                <strong>Calendar data:</strong> Events and
                                scheduling patterns from Google Calendar and
                                others
                            </li>
                            <li>
                                <strong>Task data:</strong> Info pulled from
                                productivity tools (e.g. Notion, ClickUp)
                            </li>
                            <li>
                                <strong>Voice recordings:</strong> If you choose
                                to speak, we process your voice for journaling
                                or task actions
                            </li>
                        </ul>
                        <p className="text-amber-700 mt-4">
                            We don&apos;t permanently store sensitive personal
                            data right now — it&apos;s used temporarily for
                            processing, then discarded.
                        </p>
                    </section>

                    <hr className="border-gray-200" />

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            2. How We Use Your Data
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Your data is used only to provide you with
                            personalized feedback and burnout prevention
                            insights. Specifically, we use it to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>
                                Detect patterns of overload, stress, or
                                distraction
                            </li>
                            <li>
                                Generate smart suggestions (e.g. reschedule,
                                pick tasks, journaling help)
                            </li>
                            <li>
                                Improve your focus, health, and productivity
                            </li>
                        </ul>
                        <p className="text-gray-900 font-semibold mt-4">
                            We never sell or train on your data.
                        </p>
                    </section>

                    <hr className="border-gray-200" />

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            3. Connected Tools & Integrations
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Diran AI integrates with:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Google Calendar</li>
                            <li>Apple Health</li>
                            <li>Google Fit</li>
                            <li>Notion</li>
                            <li>ClickUp</li>
                            <li>Other user-authorized tools</li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                            You control what you connect. You can revoke access
                            at any time.
                        </p>
                    </section>

                    <hr className="border-gray-200" />

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            4. Third-Party Services
                        </h2>
                        <p className="text-gray-700 mb-4">
                            We use trusted services to operate the app:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Supabase</li>
                            <li>Vercel</li>
                            <li>Google OAuth</li>
                            <li>AWS</li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                            These services may temporarily handle your data for
                            processing under their own privacy standards.
                        </p>
                    </section>

                    <hr className="border-gray-200" />

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            5. Cookies & Tracking
                        </h2>
                        <p className="text-gray-700 mb-4">
                            We do not use cookies, ad trackers, or analytics
                            tools (e.g. Google Analytics) at this time.
                        </p>
                        <p className="text-gray-700">
                            If that changes, we&apos;ll update this policy and
                            notify users clearly.
                        </p>
                    </section>

                    <hr className="border-gray-200" />

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            6. Your Rights & Choices
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>You can disconnect integrations at any time</li>
                            <li>You can request deletion of your data.</li>
                            <li>
                                You can stop using Diran AI at any time — your
                                data won&apos;t be retained
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-200" />

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            7. Contact
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Have questions or want your data removed?
                        </p>
                        <p className="text-gray-700">
                            Email:{' '}
                            <a
                                href="mailto:sharqawy@diran.app"
                                className="text-orange-600 hover:text-orange-700 underline">
                                sharqawy@diran.app
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
