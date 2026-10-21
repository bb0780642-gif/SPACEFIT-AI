import React from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { WorkflowSection } from '@/components/landing/WorkflowSection'
import { AIAssistantSection } from '@/components/landing/AIAssistantSection'
import { CTASection } from '@/components/landing/CTASection'

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <AIAssistantSection />
      <CTASection />
    </div>
  )
}
