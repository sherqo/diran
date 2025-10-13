import Link from 'next/link';
import { GridBg } from '../GridBg';

const PrivacySection = () => {
    return (
        <section className="w-full flex flex-col items-center justify-center py-20 text-center">
            <GridBg>
                {/* className="font-clash font-medium text-4xl md:text-6xl text-primary text-center mb-4 md:mb-8 px-6" */}
                <h2 className="font-clash font-medium bg-gradient-to-b from-neutral-100 to-neutral-400 bg-clip-text text-5xl sm:text-6xl text-transparent py-4 mb-4">
                    Your data
                </h2>
                <div className="max-w-3xl text-center px-6 pb-4 text-lg font-semibold text-muted/70">
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
