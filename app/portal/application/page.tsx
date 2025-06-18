"use client";

import React, {useEffect, useState} from "react";
import {CalendarDays, CheckCircle, Clock, CloudDownload, Loader2, MapPin} from "lucide-react";
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
import { Button } from "@/components/ui/button";

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
  const [showAcceptancePage, setShowAcceptancePage] = useState(true);

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
                  application?.status === 'INTERVIEW_SCHEDULED' && showAcceptancePage ? <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="relative mb-8">
                    {/* Animated confetti background */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(30)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute w-2 h-2 bg-green-400 rounded-full animate-float"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: 0.7
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="bg-green-100 p-6 rounded-full inline-block mb-6">
                        <CheckCircle className="h-16 w-16 text-green-600" />
                      </div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">Congratulations!</h1>
                      <p className="text-xl text-gray-600 mb-8">
                        You&apos;ve been invited to interview to the MOH HTI Program
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 text-left">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Interview Details</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-50 p-2 rounded-full">
                          <CalendarDays className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Interview Date</h3>
                          <p className="text-gray-600">{application?.invitation?.context?.date} at {application?.invitation?.context?.time}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-green-50 p-2 rounded-full">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Location</h3>
                          <p className="text-gray-600">{application?.invitation?.context?.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-green-50 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Interview Fee</h3>
                          <p className="text-gray-600">GHS{application?.invitation?.context?.fee}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-green-50 p-2 rounded-full">
                          <CloudDownload className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Required Documents</h3>
                          <ul className="text-gray-600 list-disc pl-5">  {/* Adds bullet points and padding */}
                            <li>Original Certificate(s)</li>
                            <li>Biometric Birth Certificate</li>
                            <li>Testimonial (optional)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setShowAcceptancePage(false)}
                      variant="outline" 
                      className="px-8 py-3"
                    >
                      Return to Portal
                    </Button>
                  </div>
                </div>
              </div>: renderCurrentStep()
              )}
             {/* {application && <QuickActions />}*/}
            </main>
            <AppFooter />
          </div>
        </div>
      </ProtectedRoute>
  );
}
