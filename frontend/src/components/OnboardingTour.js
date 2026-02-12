import React, { useState, useEffect } from 'react';

const OnboardingTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      title: 'Welcome to Legistra! 👋',
      description: 'Your AI-powered legal document analysis platform. Let\'s take a quick tour!',
      target: null,
      position: 'center'
    },
    {
      title: 'Upload Documents 📄',
      description: 'Start by uploading your legal documents here. We support PDF, DOCX, DOC, and TXT files.',
      target: 'upload-area',
      position: 'bottom'
    },
    {
      title: 'Analyze Documents 🔍',
      description: 'Once uploaded, navigate to the Analysis page to review clauses, risks, and get AI-powered insights.',
      target: 'analysis-nav',
      position: 'right'
    },
    {
      title: 'Mobile Friendly 📱',
      description: 'Access all features on any device! Use the hamburger menu on mobile to navigate.',
      target: 'mobile-menu',
      position: 'bottom'
    },
    {
      title: 'You\'re All Set! 🎉',
      description: 'Start uploading your first document to experience the power of AI-driven legal analysis!',
      target: null,
      position: 'center'
    }
  ];

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('legistra_tour_completed');
    if (!hasSeenTour) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('legistra_tour_completed', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isCentered = step.position === 'center';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in" />

      {/* Tour Card */}
      <div
        className={`fixed z-50 ${
          isCentered
            ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
            : 'top-20 right-4'
        } max-w-md animate-scale-in`}
      >
        <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-primary-500">
          {/* Progress Indicator */}
          <div className="flex gap-1 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Skip Tour
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn-primary"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>

          {/* Step Counter */}
          <div className="text-center mt-4 text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Arrow pointer (for non-centered steps) */}
        {!isCentered && step.position === 'bottom' && (
          <div className="absolute -top-2 left-8 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-primary-500"></div>
        )}
      </div>
    </>
  );
};

export default OnboardingTour;
