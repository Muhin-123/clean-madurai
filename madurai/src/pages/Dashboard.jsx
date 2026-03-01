import HeroSection from '../components/dashboard/HeroSection';
import StatCards from '../components/dashboard/StatCards';
import SmartBinMap from '../components/dashboard/SmartBinMap';
import Charts from '../components/dashboard/Charts';
import WardLeaderboard from '../components/dashboard/WardLeaderboard';
import RecentComplaints from '../components/dashboard/RecentComplaints';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <HeroSection />
      <StatCards />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SmartBinMap />
        </div>
        <div>
          <WardLeaderboard />
        </div>
      </div>
      <Charts />
      <RecentComplaints />
    </div>
  );
}
