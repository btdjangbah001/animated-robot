"use client";

import * as React from 'react';
import { AppHeader } from '@/components/layout/appHeader';
import { AppFooter } from '@/components/layout/appFooter';
import { ProgressSteps } from '@/components/application/progressSteps';
import { ProgramDetailsForm } from '@/components/application/programDetailsForm';
import { AcademicDetailsForm } from '@/components/application/academicDetailsForm';
import {QuickActions} from "@/components/application/quickActions";
import {PersonalDetailsForm} from "@/components/application/personalDetailsForm";
import {ApplicationPreview} from "@/components/application/applicationPreview";
import {useState} from "react";


const applicationSteps = [
    { id: 1, label: 'Program Details' },
    { id: 2, label: 'Academic Details' },
    { id: 3, label: 'Personal Details' },
    { id: 4, label: 'Preview & Submit' },
];

export default function ApplicationFormPage() {
    const [currentStepId, setCurrentStepId] = useState(1);

    const handleNextStep = () => {
        if (currentStepId < applicationSteps.length) {
            setCurrentStepId(prevStep => prevStep + 1);
            window.scrollTo(0, 0);
        } else {
            console.log("Final submission attempt...");
        }
    };

    const handlePreviousStep = () => {
        if (currentStepId > 1) {
            setCurrentStepId(prevStep => prevStep - 1);
            window.scrollTo(0, 0);
        }
    };


    const handleFinalSubmit = () => {}

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <AppHeader />

                <main className="flex flex-col gap-8 mt-0">
                    <ProgressSteps steps={applicationSteps} currentStepId={currentStepId} />

                    {currentStepId === 1 && (
                        <ProgramDetailsForm
                            onNext={handleNextStep}
                        />
                    )}
                    {currentStepId === 2 && (
                        <AcademicDetailsForm
                            onNext={handleNextStep}
                            onBack={handlePreviousStep}
                        />
                    )}
                    {currentStepId === 3 && (
              <PersonalDetailsForm
                onNext={handleNextStep}
                onBack={handlePreviousStep}
               />
            )}
                    {currentStepId === 4 && (
              <ApplicationPreview
                 onBack={handlePreviousStep}
                 onEdit={handlePreviousStep}
                 onSubmit={handleFinalSubmit}
            />)}
                    <QuickActions />
                </main>

                <AppFooter />
            </div>
        </div>
    );
}
