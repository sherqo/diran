import { Metadata } from 'next';
import AppNavbar from '@/components/features/navbar/AppNavbar';
import HeroSection from '@/components/features/landing/sections/HeroSection';
// import FeaturesSection from '@/components/features/landing/sections/FeaturesSection';
// import PrivacySection from '@/components/features/landing/sections/PrivacySection';
// import CTASection from '@/components/features/landing/sections/CTASection';
import FaqSection from '@/components/features/landing/sections/FaqSection';

export const metadata: Metadata = {
    title: 'Home',
};

const LandingPage = () => {
    return (
        <div className="w-full">
            <AppNavbar />
            <HeroSection />
            {/* <FeaturesSection /> */}
            {/* <PrivacySection /> */}
            {/* <CTASection /> */}
            <FaqSection />
        </div>
    );
};

export default LandingPage;
