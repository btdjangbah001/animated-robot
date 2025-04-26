"use client";

import React, {useEffect, useRef} from 'react';
import {ArrowLeft, Printer} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {ApplicationPreview} from '@/components/application/applicationPreview';
import useApplicationStore from '@/store/applicationStore';
import {useRouter} from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DownloadApplicationPage() {
    const pdfPreviewRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const application = useApplicationStore((state) => state.application);
    const isLoading = useApplicationStore((state) => state.isLoading);
    const error = useApplicationStore((state) => state.error);
    const fetchApplication = useApplicationStore((state) => state.fetchApplication);

    useEffect(() => {
        if (!application && !isLoading && !error) {
            fetchApplication();
        }
    }, [application, isLoading, error, fetchApplication]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                {isLoading && !application ? (
                    <div className="flex justify-center items-center py-10">
                        <span className="text-gray-600">Loading application data...</span>
                    </div>
                ) : !application ? (
                    <div className="text-center text-gray-500 py-10">Application data not available.</div>
                ) : (
                    <>
                        <div ref={pdfPreviewRef} className="p-1 border rounded-md bg-white mb-6">
                            <ApplicationPreview
                                isPdfMode={true}
                                onBack={() => {}}
                                onSubmit={() => {}}
                                onEdit={() => {}}
                            />
                        </div>

                        <div className="flex justify-between">

                            <Button
                                type="button"
                                variant="outline"
                                onClick={()=>router.back()}
                                disabled={isLoading}
                            >
                                {" "}
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back{" "}
                            </Button>
                            <Button
                                type="button"
                                onClick={handlePrint}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print / Download
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
}
