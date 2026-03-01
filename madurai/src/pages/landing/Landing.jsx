import LandingHero from '../../components/animations/LandingHero';
import LandingWhy from '../../components/animations/LandingWhy';
import LandingProcess from '../../components/animations/LandingProcess';
import LandingStats from '../../components/animations/LandingStats';
import LandingRoles from '../../components/animations/LandingRoles';
import LandingCTA from '../../components/animations/LandingCTA';
import LandingFooter from '../../components/animations/LandingFooter';

export default function Landing() {
    return (
        <div className="bg-white text-gray-800 selection:bg-[#A5D6A7]/40 selection:text-[#1B5E20]">
            <LandingHero />
            <LandingWhy />
            <LandingProcess />
            <LandingStats />
            <LandingRoles />
            <LandingCTA />
            <LandingFooter />
        </div>
    );
}
