import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { WalkthroughStep } from '../types';
import { getPositionForElement } from '../utils';

interface WalkthroughProps {
  onComplete: () => void;
  setActiveTab: (tab: string) => void;
  WALKTHROUGH_STEPS: WalkthroughStep[];
}

const Walkthrough: React.FC<WalkthroughProps> = ({ onComplete, setActiveTab, WALKTHROUGH_STEPS }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = WALKTHROUGH_STEPS[currentStep];

  useEffect(() => {
    if (step) {
      const target = document.querySelector(step.target);
      if (target) {
        const yOffset = -100; 
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      step.onEnter?.();
      if (step.tabId) {
        setActiveTab(step.tabId);
      }
    }
  }, [currentStep, step, setActiveTab]);

  if (!step) {
    return null; // Or some fallback UI if a step is not found
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="absolute pointer-events-auto bg-white rounded-lg shadow-xl p-4 mx-4 max-w-[calc(100%-2rem)] md:max-w-md animate-bounce-gentle"
        style={{
          ...getPositionForElement(step.target, step.placement),
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{step.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="hover:bg-gray-100"
          >
            Skip tutorial
          </Button>
        </div>
        <p className="text-gray-600 mb-4">{step.content}</p>
        <div className="flex justify-between items-center">
          <div className="space-x-1">
            {WALKTHROUGH_STEPS.map((_, index) => (
              <span
                key={index}
                className={`inline-block w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="space-x-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </Button>
            )}
            {currentStep < WALKTHROUGH_STEPS.length - 1 ? (
              <Button 
                onClick={() => setCurrentStep(prev => prev + 1)}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={onComplete}
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Walkthrough;