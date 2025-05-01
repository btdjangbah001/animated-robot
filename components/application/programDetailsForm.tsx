"use client";
import React, {FormEvent, useEffect, useState} from "react";
import {ArrowRight, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import useApplicationStore from "@/store/applicationStore";
import {ApplicationInput} from "@/types/application";
import {mapStageToStepId} from "@/lib/consts";
import {toast} from "react-toastify";

interface ProgramDetailsFormProps {
  onNext: () => void;
}

interface InitialProgramDetails {
  programTypeId: string;
  institutionId: string;
  programId: string;
}

export function ProgramDetailsForm({ onNext }: ProgramDetailsFormProps) {
  const application = useApplicationStore((state) => state.application);

  const [selectedProgramTypeId, setSelectedProgramTypeId] =
    useState<string>(application?.program?.programTypeId?.toString() ?? "");
  const [selectedInstitutionId, setSelectedInstitutionId] =
    useState<string>(application?.institutionId?.toString() ?? "");
  const [selectedProgramId, setSelectedProgramId] = useState<string>(application?.programId?.toString() ?? "");
  const [initialValues, setInitialValues] =
    useState<InitialProgramDetails | null>(null);
  const disable = application?.registrationStage === "SUBMITTED";

  const applicationId = useApplicationStore((state) => state.applicationId);
  const updateApplication = useApplicationStore(
    (state) => state.updateApplication,
  );
  const isLoading = useApplicationStore((state) => state.isLoading);
  const error = useApplicationStore((state) => state.error);
  const programTypes = useApplicationStore((state) => state.programTypes);
  const institutions = useApplicationStore((state) => state.institutions);
  const programs = useApplicationStore((state) => state.programs);
  const isLoadingProgramTypes = useApplicationStore(
    (state) => state.isLoadingProgramTypes,
  );
  const isLoadingInstitutions = useApplicationStore(
    (state) => state.isLoadingInstitutions,
  );
  const isLoadingPrograms = useApplicationStore(
    (state) => state.isLoadingPrograms,
  );
  const fetchApplication = useApplicationStore(
    (state) => state.fetchApplication,
  );
  const fetchProgramTypes = useApplicationStore(
    (state) => state.fetchProgramTypes,
  );
  const fetchInstitutions = useApplicationStore(
    (state) => state.fetchInstitutions,
  );
  const fetchPrograms = useApplicationStore((state) => state.fetchPrograms);
  const clearInstitutions = useApplicationStore(
    (state) => state.clearInstitutions,
  );
  const clearPrograms = useApplicationStore((state) => state.clearPrograms);

  useEffect(() => {
    if (!application && !isLoading && !error) fetchApplication().then(() => {});
    if (programTypes.length === 0) fetchProgramTypes().then(() => {});
  }, [
    fetchProgramTypes,
    programTypes.length,
    application,
    isLoading,
    error,
    fetchApplication,
  ]);


  useEffect(() => {
    if (application) {
      const initialProgramTypeId =
        application.program?.programTypeId?.toString() ?? "";
      const initialInstitutionId = application.institution?.id?.toString() ?? "";
      const initialProgramId = application.program?.id?.toString() ?? "";

      setSelectedProgramTypeId(initialProgramTypeId);
      setSelectedInstitutionId(initialInstitutionId);
      setSelectedProgramId(initialProgramId);

      setInitialValues({
        programTypeId: initialProgramTypeId,
        institutionId: initialInstitutionId,
        programId: initialProgramId,
      });
    }
  }, [application]);

  useEffect(() => {
    if (selectedProgramTypeId) {
      fetchInstitutions(selectedProgramTypeId).then(() => {
        setSelectedInstitutionId(application?.institution?.id?.toString() ?? "");
      });
    } else {
      clearInstitutions();
    }
  }, [application, selectedProgramTypeId, fetchInstitutions, clearInstitutions]);

  useEffect(() => {
    if (selectedInstitutionId && selectedProgramTypeId) {
      fetchPrograms(selectedProgramTypeId, selectedInstitutionId).then(
        () => {
          setSelectedProgramId(application?.program?.id?.toString() ?? "");
        },
      );
    } else {
      clearPrograms();
    }
  }, [
    application,
    selectedInstitutionId,
    selectedProgramTypeId,
    fetchPrograms,
    clearPrograms,
  ]);

  const handleProgramTypeChange = (value: string) => {
    setSelectedProgramTypeId(value);
    setSelectedInstitutionId("");
    setSelectedProgramId("");
  };

  const handleInstitutionChange = (value: string) => {
    setSelectedInstitutionId(value);
    setSelectedProgramId("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (disable){
      onNext();
      return;
    }

    if (
      !selectedProgramTypeId ||
      !selectedInstitutionId ||
      !selectedProgramId
    ) {
      toast.error("Please complete all program selections.");
      return;
    }
    if (!applicationId) {
      toast.error("Cannot save progress: Application ID not found.");
      return;
    }

    const isDirty =
      selectedProgramTypeId !== initialValues?.programTypeId ||
      selectedInstitutionId !== initialValues?.institutionId ||
      selectedProgramId !== initialValues?.programId;

    if (!isDirty) {
      onNext();
      return;
    }

    const payload: Partial<ApplicationInput> = {
      institutionId: Number(selectedInstitutionId),
      programId: Number(selectedProgramId),
      registrationStage: mapStageToStepId(application?.registrationStage ?? "PROGRAM_DETAILS") <= mapStageToStepId("PROGRAM_DETAILS")
          ? "ACADEMIC_DETAILS"
          :  application?.registrationStage,
    };

    const success = await updateApplication(payload);
    if (success) {
      setInitialValues({
        programTypeId: selectedProgramTypeId,
        institutionId: selectedInstitutionId,
        programId: selectedProgramId,
      });
      onNext();
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        {" "}
        <CardTitle className="text-xl font-semibold text-gray-900">
          {" "}
          Program Details{" "}
        </CardTitle>{" "}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="program-type">
                Program Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedProgramTypeId}
                onValueChange={handleProgramTypeChange}
                required
                disabled={(isLoadingProgramTypes || isLoading) || disable}
              >
                <SelectTrigger
                  id="program-type"
                  className="w-full focus:ring-green-500"
                >
                  {" "}
                  <SelectValue placeholder="Select program type..." />{" "}
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProgramTypes ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    programTypes.map((pt) => (
                      <SelectItem key={pt.id} value={pt.id.toString()}>
                        {pt.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">
                Institution <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedInstitutionId}
                onValueChange={handleInstitutionChange}
                required
                disabled={
                  (!selectedProgramTypeId || isLoadingInstitutions || isLoading) || disable
                }
              >
                <SelectTrigger
                  id="institution"
                  className="w-full focus:ring-green-500"
                >
                  {" "}
                  <SelectValue
                    placeholder={
                      !selectedProgramTypeId
                        ? "Select program type first"
                        : "Select institution..."
                    }
                  />{" "}
                </SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search options...">
                  {isLoadingInstitutions ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.name ?? inst.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">
                Program <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedProgramId}
                onValueChange={setSelectedProgramId}
                required
                disabled={
                  (!selectedInstitutionId || isLoadingPrograms || isLoading) || disable
                }
              >
                <SelectTrigger
                  id="program"
                  className="w-full focus:ring-green-500"
                >
                  {" "}
                  <SelectValue
                    placeholder={
                      !selectedInstitutionId
                        ? "Select institution first"
                        : "Select program..."
                    }
                  />{" "}
                </SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search options...">
                  {isLoadingPrograms ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    programs.map((prog) => (
                      <SelectItem key={prog.id} value={prog.id.toString()}>
                        {prog.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600"
              disabled={isLoading || !selectedProgramId || !applicationId}
            >
              {" "}
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              Next <ArrowRight className="ml-2 h-4 w-4" />{" "}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
