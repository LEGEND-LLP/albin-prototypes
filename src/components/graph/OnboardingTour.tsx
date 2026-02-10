import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "The Graph",
    description: "This is your codebase. Each card is a module. Lines show how they connect.",
    position: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    arrow: "none",
  },
  {
    title: "Zoom Levels",
    description: "Zoom out for the big picture, zoom in for file-level details.",
    position: { top: "180px", left: "290px" },
    arrow: "left",
  },
  {
    title: "Click to Explore",
    description: "Click any module to see what it does, what it connects to, and why it matters.",
    position: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    arrow: "none",
  },
];

export function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />

          {/* Tooltip */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 w-80 bg-card rounded-xl shadow-2xl border p-5"
            style={currentStep.position as React.CSSProperties}
          >
            {/* Arrow */}
            {currentStep.arrow === "left" && (
              <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2">
                <div className="w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-card" />
              </div>
            )}

            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">
                  Step {step + 1} of {steps.length}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{currentStep.title}</h3>
              <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <Button onClick={handleNext} size="sm">
                {isLastStep ? "Got it!" : "Next"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
