"use client";
import {FormEvent, useEffect, useState} from "react";
import {ArrowLeft, ArrowRight, Loader2, PlusCircle, Trash2,} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import axiosInstance from "@/lib/axios";
import useApplicationStore from "@/store/applicationStore";
import {ApplicationInput, CoreResultInput, ElectiveResultInput,} from "@/types/application";
import {SubjectOutput} from "@/types/applicant";
import {toast} from "react-toastify";

interface ElectiveSubjectLocal {
  id: string;
  dbId?: number | null;
  waecCourseId: string;
  subjectId: string;
  grade: string;
  indexNumber: string;
  examYear: string;
  examMonth: string;
  subjectOptions?: SubjectOutput[];
  loadingSubjects?: boolean;
}
interface CoreSubjectLocal {
  id: string;
  subjectId: number;
  subjectName: string;
  grade: string;
  indexNumber: string;
  examYear: string;
  examMonth: string;
}

interface AcademicDetailsFormProps {
  onNext: () => void;
  onBack: () => void;
}

const wassceGradeOptions = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "D8"];
const ssceGradeOptions = ["A","B","C","D","E","F"];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 20 }, (_, i) =>
  (currentYear - i).toString(),
);
const monthOptions = ["May/June", "Nov/Dec"];

export function AcademicDetailsForm({
  onNext,
  onBack,
}: AcademicDetailsFormProps) {
  const [applicationType, setApplicationType] = useState<string>("");
  const [electiveSubjects, setElectiveSubjects] = useState<
    ElectiveSubjectLocal[]
  >([]);
  const [coreSubjects, setCoreSubjects] = useState<CoreSubjectLocal[]>([]);

  const application = useApplicationStore((state) => state.application);
  const applicationId = useApplicationStore((state) => state.applicationId);
  const updateApplication = useApplicationStore(
    (state) => state.updateApplication,
  );
  const isLoading = useApplicationStore((state) => state.isLoading);
  const error = useApplicationStore((state) => state.error);
  const setError = useApplicationStore((state) => state.setError);
  const waecCourses = useApplicationStore((state) => state.waecCourses);
  const isLoadingWaecCourses = useApplicationStore(
    (state) => state.isLoadingWaecCourses,
  );
  const fetchWaecCourses = useApplicationStore(
    (state) => state.fetchWaecCourses,
  );
  const coreSubjectsOptions = useApplicationStore(
    (state) => state.coreSubjectsOptions,
  );
  const isLoadingCoreSubjects = useApplicationStore(
    (state) => state.isLoadingCoreSubjects,
  );
  const fetchCoreSubjects = useApplicationStore(
    (state) => state.fetchCoreSubjects,
  );
  const dropdownError = useApplicationStore((state) => state.dropdownError);

  useEffect(() => {
    if (waecCourses.length === 0) fetchWaecCourses().then(() => {});
    if (coreSubjectsOptions.length === 0) fetchCoreSubjects().then(() => {});
  }, [
    fetchWaecCourses,
    fetchCoreSubjects,
    waecCourses.length,
    coreSubjectsOptions.length,
  ]);

  useEffect(() => {
    if (application && coreSubjectsOptions.length > 0) {
      setApplicationType(application.examinationType || "WASSCE");

      const electivesFromStore = application.electiveResults?.map((res) => ({
        id: res.id?.toString() ?? crypto.randomUUID(),
        dbId: res.id ?? null,
        waecCourseId: res.courseId?.toString() || "",
        subjectId: res.subjectId?.toString() || "",
        grade: res.grade || "",
        indexNumber: res.indexNumber || "",
        examYear: res.year?.toString() || "",
        examMonth: res.month || "",
        subjectOptions: [],
        loadingSubjects: false,
      })) || [
        {
          id: crypto.randomUUID(),
          dbId: null,
          waecCourseId: "",
          subjectId: "",
          grade: "",
          indexNumber: "",
          examYear: "",
          examMonth: "",
          subjectOptions: [],
          loadingSubjects: false,
        },
      ];
      setElectiveSubjects(electivesFromStore);

      const coresFromStore = coreSubjectsOptions.map((coreOpt) => {
        const savedResult = application.coreResults?.find(
          (res) => res.subjectId === coreOpt.id,
        );
        return {
          id: `core-${coreOpt.id}`,
          subjectId: coreOpt.id,
          subjectName: coreOpt.name || "Unknown Core Subject",
          grade: savedResult?.grade || "",
          indexNumber: savedResult?.indexNumber || "",
          examYear: savedResult?.year?.toString() || "",
          examMonth: savedResult?.month || "",
        };
      });
      setCoreSubjects(coresFromStore);

      electivesFromStore.forEach((elective) => {
        if (elective.waecCourseId) {
          handleWaecCourseChange(elective.id, elective.waecCourseId, true).then(
            () => {},
          );
        }
      });
    }
  }, [application, coreSubjectsOptions]);

  const handleElectiveSubjectChange = (
    id: string,
    field: keyof Omit<
      ElectiveSubjectLocal,
      "id" | "dbId" | "subjectOptions" | "loadingSubjects"
    >,
    value: string,
  ) => {
    setElectiveSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleWaecCourseChange = async (
    rowId: string,
    courseIdStr: string,
    isPrefill = false,
  ) => {
    const courseId = Number(courseIdStr);
    setElectiveSubjects((prev) =>
      prev.map((s) =>
        s.id === rowId
          ? {
              ...s,
              waecCourseId: courseIdStr,
              subjectId: isPrefill ? s.subjectId : "",
              subjectOptions: [],
              loadingSubjects: true,
            }
          : s,
      ),
    );
    if (!courseId) return;
    try {
      const response = await axiosInstance.get(
        `/api/v1.0/subjects/electives-by-course/${courseId}`,
      );
      const subjectOptions: SubjectOutput[] =
        response.data?.map((s: any) => ({
          id: s.id,
          name: s.name,
          core: s.core,
          title: s.name,
        })) || [];
      setElectiveSubjects((prev) =>
        prev.map((s) =>
          s.id === rowId
            ? { ...s, subjectOptions: subjectOptions, loadingSubjects: false }
            : s,
        ),
      );
    } catch (err) {
      toast.error(`Failed to fetch subjects.`)
      setElectiveSubjects((prev) =>
        prev.map((s) =>
          s.id === rowId ? { ...s, loadingSubjects: false } : s,
        ),
      );
    }
  };

  const addSubjectRow = () => {
    setElectiveSubjects((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        dbId: null,
        waecCourseId: "",
        subjectId: "",
        grade: "",
        indexNumber: "",
        examYear: "",
        examMonth: "",
        subjectOptions: [],
        loadingSubjects: false,
      },
    ]);
  };
  const removeSubjectRow = (id: string) => {
    setElectiveSubjects((prev) => prev.filter((s) => s.id !== id));
  };
  const handleCoreSubjectChange = (
    localId: string,
    field: keyof Omit<CoreSubjectLocal, "id" | "subjectName" | "subjectId">,
    value: string,
  ) => {
    setCoreSubjects((prev) =>
      prev.map((s) => (s.id === localId ? { ...s, [field]: value } : s)),
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!applicationId) {
      setError("Application ID not found.");
      return;
    }

    const mappedElectiveResults: ElectiveResultInput[] = electiveSubjects
      .filter(
        (s) =>
          s.subjectId &&
          s.grade &&
          s.indexNumber &&
          s.examYear &&
          s.examMonth &&
          s.waecCourseId,
      )
      .map((s) => ({
        courseId: Number(s.waecCourseId),
        subjectId: Number(s.subjectId),
        grade: s.grade,
        indexNumber: s.indexNumber,
        year: Number(s.examYear),
        month: s.examMonth,
      }));

    const mappedCoreResults: CoreResultInput[] = coreSubjects
      .filter((s) => s.grade && s.indexNumber && s.examYear && s.examMonth)
      .map((s) => ({
        subjectId: s.subjectId,
        grade: s.grade,
        indexNumber: s.indexNumber,
        year: Number(s.examYear),
        month: s.examMonth,
      }));

    const electivesComplete = electiveSubjects.every(
      (s) =>
        s.subjectId &&
        s.grade &&
        s.indexNumber &&
        s.examYear &&
        s.examMonth &&
        s.waecCourseId,
    );
    const coresComplete = coreSubjects.every(
      (s) => s.grade && s.indexNumber && s.examYear && s.examMonth,
    );

    if (!electivesComplete || !coresComplete) {
      toast.error("Please fill required fields (Grade, Index, Year, Month) for every subject.");
      return;
    }

    const payload: Partial<ApplicationInput> = {
      examinationType: applicationType,
      electiveResults: mappedElectiveResults,
      coreResults: mappedCoreResults,
      registrationStage: "PERSONAL_DETAILS",
    };

    const success = await updateApplication(payload);
    if (success) {
      onNext();
    }
  };

  useEffect(() => {
    const displayError = error || dropdownError;
    if (displayError){
      toast.error(displayError)
    }
  }, [error, dropdownError]);

  const handleBack = () => {
    onBack();
  };

  const gradeOptionsToUse = applicationType === "WASSCE" ? wassceGradeOptions : ssceGradeOptions;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        {" "}
        <CardTitle>Fill your past academic details</CardTitle>{" "}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="application-type">
              Application Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={applicationType}
              onValueChange={setApplicationType}
              required
              disabled={isLoading}
            >
              <SelectTrigger id="application-type" className="w-full">
                <SelectValue placeholder="Select application type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WASSCE">WASSCE</SelectItem>
                <SelectItem value="SSSCE">SSSCE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />

          {/* --- Elective Subjects Section --- */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Provide the following information
              </h3>
              <CardDescription className="mb-4 text-sm">
                Note: You can not use grades from more than 3 certificates.
              </CardDescription>
              <h4 className="text-base font-semibold text-gray-700 mb-1">
                Elective Subjects
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Input your best subjects and grades...
              </p>
            </div>
            {/* Labels Row - Hidden below lg */}
            {/* Adjusted lg grid definition to match input row */}
            <div className="hidden lg:grid lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_auto] gap-x-4 px-1 pb-2 border-b">
              <Label>Waec Course</Label> <Label>Subject</Label>{" "}
              <Label>Grade</Label> <Label>Index Number</Label>{" "}
              <Label>
                Exam Date <span className="text-red-500">*</span>
              </Label>{" "}
              <span className="sr-only">Actions</span>
            </div>
            <div className="space-y-5">
              {electiveSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border-b border-gray-200 pb-5 last:border-b-0 last:pb-0"
                >
                  {/* Grid for Inputs: 2 cols default, custom fr units on lg */}
                  <div className="grid grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_auto] gap-4 items-stretch">
                    {/* Waec Course - lg:col-span-1 implied by grid definition */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`waecCourse-${subject.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Waec Course
                      </Label>
                      <Select
                        value={subject.waecCourseId}
                        onValueChange={(value) =>
                          handleWaecCourseChange(subject.id, value)
                        }
                        disabled={isLoadingWaecCourses || isLoading}
                      >
                        <SelectTrigger
                          id={`waecCourse-${subject.id}`}
                          className="w-full"
                        >
                          <SelectValue placeholder="Select Waec Course" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingWaecCourses ? (
                            <SelectItem value="load" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            waecCourses.map((opt) => (
                              <SelectItem
                                key={opt.id}
                                value={opt.id.toString()}
                              >
                                {opt.title}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Subject - lg:col-span-1 implied */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`subject-${subject.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Subject
                      </Label>
                      <Select
                        value={subject.subjectId}
                        onValueChange={(value) =>
                          handleElectiveSubjectChange(
                            subject.id,
                            "subjectId",
                            value,
                          )
                        }
                        disabled={
                          !subject.waecCourseId ||
                          subject.loadingSubjects ||
                          isLoading
                        }
                      >
                        <SelectTrigger
                          id={`subject-${subject.id}`}
                          className="w-full"
                        >
                          <SelectValue
                            placeholder={
                              !subject.waecCourseId
                                ? "Select course first"
                                : "Select Subject"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {subject.loadingSubjects ? (
                            <SelectItem value="load" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            subject.subjectOptions?.map((opt) => (
                              <SelectItem
                                key={opt.id}
                                value={opt.id.toString()}
                              >
                                {opt.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Grade - lg:col-span-1 implied */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`grade-${subject.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Grade
                      </Label>
                      <Select
                        value={subject.grade}
                        onValueChange={(value) =>
                          handleElectiveSubjectChange(
                            subject.id,
                            "grade",
                            value,
                          )
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          id={`grade-${subject.id}`}
                          className="w-full"
                        >
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptionsToUse.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Index Number - lg:col-span-1 implied */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`indexNumber-${subject.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Index Number
                      </Label>
                      <Input
                        id={`indexNumber-${subject.id}`}
                        type="text"
                        placeholder="Index No."
                        value={subject.indexNumber}
                        onChange={(e) =>
                          handleElectiveSubjectChange(
                            subject.id,
                            "indexNumber",
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                        className="w-full"
                      />
                    </div>
                    {/* Exam Date - Spans 2 cols on small, takes 1.5fr space on lg */}
                    <div className="space-y-1.5 col-span-2 lg:col-span-1">
                      <Label className="text-sm font-medium text-gray-600 lg:hidden">
                        Exam Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={subject.examYear}
                          onValueChange={(value) =>
                            handleElectiveSubjectChange(
                              subject.id,
                              "examYear",
                              value,
                            )
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            aria-label="Exam Year"
                            className="w-full"
                          >
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={subject.examMonth}
                          onValueChange={(value) =>
                            handleElectiveSubjectChange(
                              subject.id,
                              "examMonth",
                              value,
                            )
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            aria-label="Exam Month"
                            className="w-full"
                          >
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {monthOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Remove Button - Spans 2 cols on small, takes auto space on lg */}
                    <div className="flex justify-end items-end col-span-2 lg:col-span-1">
                      {electiveSubjects.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 h-9 w-9"
                          onClick={() => removeSubjectRow(subject.id)}
                          aria-label="Remove subject row"
                          disabled={isLoading}
                        >
                          {" "}
                          <Trash2 className="h-4 w-4" />{" "}
                        </Button>
                      )}
                      {electiveSubjects.length <= 1 && (
                        <div className="h-9 w-9"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-green-700 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-800 hover:border-green-400"
                onClick={addSubjectRow}
                disabled={isLoading}
              >
                {" "}
                <PlusCircle className="mr-2 h-4 w-4" /> Add Elective
                Subject{" "}
              </Button>
            </div>
          </div>

          <Separator />

          {/* --- Core Subjects Section --- */}
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-1">
                Core Subjects
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Input your best subjects and grades...
              </p>
            </div>
            {/* Labels Row - Hidden below lg */}
            <div className="hidden lg:grid lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-x-4 px-1 pb-2 border-b">
              <Label>Subject</Label> <Label>Grade</Label>{" "}
              <Label>Index Number</Label>{" "}
              <Label>
                Exam Date <span className="text-red-500">*</span>
              </Label>
            </div>
            <div className="space-y-5">
              {isLoadingCoreSubjects && coreSubjects.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  Loading core subjects...
                </div>
              )}
              {coreSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border-b border-gray-200 pb-5 last:border-b-0 last:pb-0"
                >
                  {/* Grid for Inputs: 2 cols default, 4 cols lg */}
                  <div className="grid grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-4 items-stretch">
                    <div className="space-y-1.5 col-span-2 lg:col-span-1">
                      {" "}
                      <Label className="text-sm font-medium text-gray-600 lg:hidden">
                        Subject
                      </Label>{" "}
                      <div className="h-10 flex items-center px-3 text-sm text-gray-800 font-medium">
                        {subject.subjectName}
                      </div>{" "}
                    </div>
                    <div className="space-y-1.5">
                      {" "}
                      <Label
                        htmlFor={`core-grade-${subject.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Grade
                      </Label>{" "}
                      <Select
                        value={subject.grade}
                        onValueChange={(value) =>
                          handleCoreSubjectChange(subject.id, "grade", value)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          id={`core-grade-${subject.id}`}
                          className="w-full"
                        >
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptionsToUse.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>{" "}
                    </div>
                    <div className="space-y-1.5">
                      {" "}
                      <Label
                        htmlFor={`core-indexNumber-${subject.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Index Number
                      </Label>{" "}
                      <Input
                        id={`core-indexNumber-${subject.id}`}
                        type="text"
                        placeholder="Index No."
                        value={subject.indexNumber}
                        onChange={(e) =>
                          handleCoreSubjectChange(
                            subject.id,
                            "indexNumber",
                            e.target.value,
                          )
                        }
                        disabled={isLoading}
                        className="w-full"
                      />{" "}
                    </div>
                    <div className="space-y-1.5 col-span-2 lg:col-span-1">
                      {" "}
                      <Label className="text-sm font-medium text-gray-600 lg:hidden">
                        Exam Date <span className="text-red-500">*</span>
                      </Label>{" "}
                      <div className="grid grid-cols-2 gap-2">
                        {" "}
                        <Select
                          value={subject.examYear}
                          onValueChange={(value) =>
                            handleCoreSubjectChange(
                              subject.id,
                              "examYear",
                              value,
                            )
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            aria-label="Core Exam Year"
                            className="w-full"
                          >
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>{" "}
                        <Select
                          value={subject.examMonth}
                          onValueChange={(value) =>
                            handleCoreSubjectChange(
                              subject.id,
                              "examMonth",
                              value,
                            )
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            aria-label="Core Exam Month"
                            className="w-full"
                          >
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {monthOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>{" "}
                      </div>{" "}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
            >
              {" "}
              <ArrowLeft className="mr-2 h-4 w-4" /> Back{" "}
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600"
              disabled={isLoading}
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
