"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/layout/appHeader";
import { AppFooter } from "@/components/layout/appFooter";
import { ProgressSteps } from "@/components/application/progressSteps";
import { ProgramDetailsForm } from "@/components/application/programDetailsForm";
import { AcademicDetailsForm } from "@/components/application/academicDetailsForm";
import { PersonalDetailsForm } from "@/components/application/personalDetailsForm";
import { ApplicationPreview } from "@/components/application/applicationPreview";
import useApplicationStore from "@/store/applicationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuickActions } from "@/components/application/quickActions";

const applicationSteps = [
  { id: 1, label: "Program Details" },
  { id: 2, label: "Academic Details" },
  { id: 3, label: "Personal Details" },
  { id: 4, label: "Preview & Submit" },
];

const mapStageToStepId = (stage: string | null | undefined): number => {
  switch (stage) {
    case "PROGRAM_DETAILS":
      return 1;
    case "ACADEMIC_DETAILS":
      return 2;
    case "PERSONAL_DETAILS":
      return 3;
    case "COMPLETED":
      return 4;
    default:
      return 1;
  }
};

export default function ApplicationFormPage() {
  const [currentStepId, setCurrentStepId] = useState(1);
  const [hasNavigatedManually, setHasNavigatedManually] = useState(false);

  const application = useApplicationStore((state) => state.application);
  const isLoading = useApplicationStore((state) => state.isLoading);
  const error = useApplicationStore((state) => state.error);
  const fetchApplication = useApplicationStore(
    (state) => state.fetchApplication,
  );
  const updateApplication = useApplicationStore(
    (state) => state.updateApplication,
  );
  const applicationId = useApplicationStore((state) => state.applicationId);

  useEffect(() => {
    if (!application && !isLoading && !error) {
      fetchApplication().then(() => {});
    }
  }, [application, isLoading, error, fetchApplication]);

  useEffect(() => {
    if (application?.registrationStage && !hasNavigatedManually) {
      const targetStep = mapStageToStepId(application.registrationStage);
      setCurrentStepId(
        targetStep <= applicationSteps.length
          ? targetStep
          : applicationSteps.length,
      );
    }
  }, [application?.registrationStage, hasNavigatedManually]);

  const handleNextStep = () => {
    if (currentStepId < applicationSteps.length) {
      setHasNavigatedManually(true);
      setCurrentStepId(currentStepId + 1);
      window.scrollTo(0, 0);
    } else {
      handleFinalSubmit().then(() => {});
    }
  };

  const handlePreviousStep = () => {
    if (currentStepId > 1) {
      setHasNavigatedManually(true);
      setCurrentStepId((prevStep) => prevStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleEditStep = (stepId: number) => {
    if (stepId >= 1 && stepId <= applicationSteps.length) {
      setHasNavigatedManually(true);
      setCurrentStepId(stepId);
      window.scrollTo(0, 0);
    }
  };

  const handleFinalSubmit = async () => {
    if (!applicationId) {
      console.error("No Application ID for final submission");
      return;
    }
    updateApplication({ registrationStage: "COMPLETED" }).then(() => {});
  };

  const renderCurrentStep = () => {
    switch (currentStepId) {
      case 1:
        return <ProgramDetailsForm onNext={handleNextStep} />;
      case 2:
        return (
          <AcademicDetailsForm
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        return (
          <PersonalDetailsForm
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 4:
        return (
          <ApplicationPreview
            onBack={handlePreviousStep}
            onSubmit={handleFinalSubmit}
            onEdit={handleEditStep}
          />
        );
      default:
        return <ProgramDetailsForm onNext={handleNextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AppHeader />

        <main className="flex flex-col gap-8 mt-6">
          <ProgressSteps
            steps={applicationSteps}
            currentStepId={currentStepId}
          />

          {isLoading && !application && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-600">Loading application...</span>
            </div>
          )}
          {error && !application && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error Loading Application</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(!isLoading || application) && !error && renderCurrentStep()}

          <QuickActions />
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
