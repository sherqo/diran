import Link from 'next/link';
import { GridBg } from '../GridBg';

const PrivacySection = () => {
    return (
        <section className="flex w-full flex-col items-center justify-center py-20 text-center">
            <GridBg>
                {/* className="font-clash font-medium text-4xl md:text-6xl text-primary text-center mb-4 md:mb-8 px-6" */}
                <h2 className="font-clash mb-4 bg-gradient-to-b from-neutral-100 to-neutral-400 bg-clip-text py-4 text-5xl font-medium text-transparent sm:text-6xl">
                    Your data
                </h2>
                <div className="text-muted/70 max-w-3xl px-6 pb-4 text-center text-lg font-semibold">
                    <p>Diran AI doesn’t sell or train on your data.</p>
                    <p>
                        Learn more in our{' '}
                        <Link href="/privacy" className="text-muted/80">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </GridBg>
        </section>
    );
};

export default PrivacySection;
