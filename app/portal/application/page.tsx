"use client";

import React, {useEffect, useState} from "react";
import {Loader2} from "lucide-react";
import {AppHeader} from "@/components/layout/appHeader";
import {AppFooter} from "@/components/layout/appFooter";
import {ProgressSteps} from "@/components/application/progressSteps";
import {ProgramDetailsForm} from "@/components/application/programDetailsForm";
import {AcademicDetailsForm} from "@/components/application/academicDetailsForm";
import {PersonalDetailsForm} from "@/components/application/personalDetailsForm";
import {ApplicationPreview} from "@/components/application/applicationPreview";
import useApplicationStore from "@/store/applicationStore";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import {mapStageToStepId} from "@/lib/consts";

const applicationSteps = [
  { id: 1, label: "Program Details" },
  { id: 2, label: "Academic Details" },
  { id: 3, label: "Personal Details" },
  { id: 4, label: "Preview & Submit" },
];

export default function ApplicationFormPage() {
  const [currentStepId, setCurrentStepId] = useState(1);
  const [hasInitializedFromStage, setHasInitializedFromStage] = useState(false);

  const application = useApplicationStore((state) => state.application);
  const isLoading = useApplicationStore((state) => state.isLoading);
  const error = useApplicationStore((state) => state.error);
  const dropdownError = useApplicationStore((state) => state.dropdownError);
  const fetchApplication = useApplicationStore((state) => state.fetchApplication);
  const updateApplication = useApplicationStore((state) => state.updateApplication);
  const applicationId = useApplicationStore((state) => state.applicationId);

  useEffect(() => {
    const combinedError = error || dropdownError;
    if (combinedError) {
      toast.error(combinedError);
    }
  }, [error, dropdownError]);

  useEffect(() => {
    if (!application && !isLoading && !error) {
      fetchApplication().then(() => {});
    }
  }, [application, isLoading, error, fetchApplication]);

  useEffect(() => {
    if (!hasInitializedFromStage && application?.registrationStage) {
      const targetStep = mapStageToStepId(application.registrationStage);
      const stepToSet =
          targetStep <= applicationSteps.length
              ? targetStep
              : applicationSteps.length;
      if (stepToSet !== currentStepId) {
        setCurrentStepId(stepToSet);
        window.scrollTo(0, 0);
      }
      setHasInitializedFromStage(true);
    }
  }, [application?.registrationStage, currentStepId, hasInitializedFromStage]);

  const handleNextStep = () => {
    if (currentStepId >= applicationSteps.length) {
      handleFinalSubmit().then(() => {});
    } else {
      setCurrentStepId((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepId > 1) {
      setCurrentStepId((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleEditStep = (stepId: number) => {
    if (stepId >= 1 && stepId <= applicationSteps.length) {
      setCurrentStepId(stepId);
      window.scrollTo(0, 0);
    }
  };

  const handleFinalSubmit = async () => {
    if (!applicationId) {
      toast.error("No Application ID for final submission");
      return;
    }
    const success = await updateApplication({
      registrationStage: "SUBMITTED",
    });
    if (success) {
      toast.success("Application Submitted Successfully!");
    }
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
                isPdfMode={false}
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
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AppHeader />
            <main className="flex flex-col gap-8 mt-6">
              <ProgressSteps
                  steps={applicationSteps}
                  currentStepId={currentStepId}
              />
              {isLoading && !application ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-16 w-16 animate-spin text-green-500" />
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
              ) : (
                  renderCurrentStep()
              )}
             {/* {application && <QuickActions />}*/}
            </main>
            <AppFooter />
          </div>
        </div>
      </ProtectedRoute>
  );
}
