import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStepId: number;
}

export function ProgressSteps({ steps, currentStepId }: ProgressStepsProps) {
  return (
    <div className="relative mb-8">
      <div className="absolute top-[15px] left-0 right-0 h-0.5 bg-gray-200" />

      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          console.log("step", index);
          const isCompleted = step.id < currentStepId;
          const isActive = step.id === currentStepId;

          return (
            <div key={step.id} className="z-10 flex flex-col items-center px-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full font-semibold mb-2 transition-colors",
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-500",
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <div
                className={cn(
                  "text-xs sm:text-sm text-center font-medium",
                  isActive ? "text-green-600" : "text-gray-500",
                )}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
