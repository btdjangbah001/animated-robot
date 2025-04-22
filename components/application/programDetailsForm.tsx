"use client";
import React, {FormEvent, useEffect, useState} from "react";
import {ArrowRight, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import useApplicationStore from "@/store/applicationStore";
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
  const [selectedProgramTypeId, setSelectedProgramTypeId] =
    useState<string>("");
  const [selectedInstitutionId, setSelectedInstitutionId] =
    useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [initialValues, setInitialValues] =
    useState<InitialProgramDetails | null>(null);

  const application = useApplicationStore((state) => state.application);
  const applicationId = useApplicationStore((state) => state.applicationId);
  const updateApplication = useApplicationStore(
    (state) => state.updateApplication,
  );
  const isLoading = useApplicationStore((state) => state.isLoading);
  const error = useApplicationStore((state) => state.error);
  const setError = useApplicationStore((state) => state.setError);
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
  const dropdownError = useApplicationStore((state) => state.dropdownError);
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
    if (!application && !isLoading && !error) fetchApplication(applicationId ?? null).then(() => {});
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
    const combinedError = error || dropdownError;
    if (combinedError) {
      toast.error(combinedError);
    }
  }, [error, dropdownError]);

  useEffect(() => {
    if (application) {
      const initialProgramTypeId =
        application.program?.programTypeId?.toString() ?? "";
      const initialInstitutionId = application.institutionId?.toString() ?? "";
      const initialProgramId = application.programId?.toString() ?? "";

      setSelectedProgramTypeId(initialProgramTypeId);
      setSelectedInstitutionId(initialInstitutionId);
      setSelectedProgramId(initialProgramId);

      setInitialValues({
        programTypeId: initialProgramTypeId,
        institutionId: initialInstitutionId,
        programId: initialProgramId,
      });

      console.log(application);
      console.log(initialValues);
    }
  }, [application]);

  useEffect(() => {
    if (selectedProgramTypeId) {
      fetchInstitutions(selectedProgramTypeId).then(() => {});
    } else {
      clearInstitutions();
    }
  }, [selectedProgramTypeId, fetchInstitutions, clearInstitutions]);

  useEffect(() => {
    if (selectedInstitutionId && selectedProgramTypeId) {
      fetchPrograms(selectedProgramTypeId, selectedInstitutionId).then(
        () => {},
      );
    } else {
      clearPrograms();
    }
  }, [
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
    setError(null);

    if (
      !selectedProgramTypeId ||
      !selectedInstitutionId ||
      !selectedProgramId
    ) {
      setError("Please complete all program selections.");
      return;
    }
    if (!applicationId) {
      setError("Cannot save progress: Application ID not found.");
      return;
    }

    const isDirty =
      selectedProgramTypeId !== initialValues?.programTypeId ||
      selectedInstitutionId !== initialValues?.institutionId ||
      selectedProgramId !== initialValues?.programId;

    if (!isDirty) {
      console.log(
        "No changes detected in Program Details, proceeding to next step.",
      );
      onNext();
      return;
    }

    const payload = {
      institutionId: Number(selectedInstitutionId),
      programId: Number(selectedProgramId),
      registrationStage: "ACADEMIC_DETAILS",
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
                disabled={isLoadingProgramTypes || isLoading}
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
                  !selectedProgramTypeId || isLoadingInstitutions || isLoading
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
                <SelectContent>
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
                  !selectedInstitutionId || isLoadingPrograms || isLoading
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
                <SelectContent>
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
