import { Hero } from '@/components/landing/Hero';
import { LiveCounterBar } from '@/components/landing/LiveCounterBar';
import { LiveWinsFeed } from '@/components/landing/LiveWinsFeed';
import { GamesShowcase } from '@/components/landing/GamesShowcase';
import { DailyRewardTeaser } from '@/components/landing/DailyRewardTeaser';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { CtaBanner } from '@/components/landing/CtaBanner';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <LiveCounterBar />
      <LiveWinsFeed />
      <DailyRewardTeaser />
      <GamesShowcase />
      <FeaturesGrid />
      <HowItWorks />
      <FAQAccordion />
      <CtaBanner />
    </>
  );
}
