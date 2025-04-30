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
import {AcademicProfileInput, ApplicationInput, CoreResultInput, ElectiveResultInput, WorkExperienceInput,} from "@/types/application";
import {SubjectOutput} from "@/types/applicant";
import {toast} from "react-toastify";
import {mapStageToStepId} from "@/lib/consts";
import {areCoreResultsEqual, areElectivesResultsEqual} from "@/lib/utils";
import { Alert, AlertTitle } from "@mui/material";

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

interface AcademicProfile {
  id: string;
  institutionAttended: string;
  basicQualification: string;
  startDate: string;
  endDate: string;
}

interface WorkExperience {
  id: string;
  institutionWorked: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
}

interface AcademicDetailsFormProps {
  onNext: () => void;
  onBack: () => void;
}

const wassceGradeOptions = ["A1", "B2", "B3", "C4", "C5", "C6"];
const ssceGradeOptions = ["A","B","C","D"];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 20 }, (_, i) =>
  (currentYear - i).toString(),
);
const monthOptions = ["May/June", "Nov/Dec"];

export function AcademicDetailsForm({
  onNext,
  onBack,
}: AcademicDetailsFormProps) {
  const application = useApplicationStore((state) => state.application);
  const [applicationType, setApplicationType] = useState<string>(application?.examinationType ?? "");
  const [electiveSubjects, setElectiveSubjects] = useState<
    ElectiveSubjectLocal[]
  >([]);
  const [coreSubjects, setCoreSubjects] = useState<CoreSubjectLocal[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [academicProfiles, setAcademicProfiles] = useState<AcademicProfile[]>([]);
  const [isPostBasic, setIsPostBasic] = useState<boolean>(false);

  const applicationId = useApplicationStore((state) => state.applicationId);
  const updateApplication = useApplicationStore(
    (state) => state.updateApplication,
  );
  const isLoading = useApplicationStore((state) => state.isLoading);
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
  const disable = application?.registrationStage === "SUBMITTED";

  // Helper function to format date strings
  const getSafeDateString = (
    timestampMs: number | string | null | undefined,
  ): string => {
    if (!timestampMs) return "";
    try {
      const date = new Date(timestampMs);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      if (year < 1900 || year > 2100) return ""; // Basic validation
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

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
      setIsPostBasic(application.program?.programType?.postBasic ?? false);
      setApplicationType(application.examinationType || "WASSCE");

      const electivesFromStore = application.electiveResults?.map((res) => ({
        id: res.id?.toString() ?? crypto.randomUUID(),
        dbId: res.id ?? null,
        waecCourseId: res.course?.id?.toString() || "",
        subjectId: res.subject?.id?.toString() || "",
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

      const workExperiencesFromStore = application.workExperiences?.map((work) => ({
        id: work.id?.toString() ?? crypto.randomUUID(),
        institutionWorked: work.institution ?? "",
        jobTitle: work.jobTitle ?? "",
        startDate: getSafeDateString(work.startDate) ?? "",
        endDate: getSafeDateString(work.endDate) ?? "",
      }));
      setWorkExperience(workExperiencesFromStore ?? []);

      const academicProfilesFromStore = application.academicProfiles?.map((profile) => ({
        id: profile.id?.toString() ?? crypto.randomUUID(),
        institutionAttended: profile.institution ?? "",
        basicQualification: profile.qualification ?? "",
        startDate: getSafeDateString(profile.startDate) ?? "",
        endDate: getSafeDateString(profile.endDate) ?? "",
      }));
      setAcademicProfiles(academicProfilesFromStore ?? []);

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
        response.data?.map((s: { id: number; name: string; core: boolean }) => ({
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (electiveSubjects.length === 4) {
      toast.info("You can only add a maximum of 4 elective subjects.")
      return;
    }
    if (electiveSubjects.length > 2) {
      const newItems = [...coreSubjects];
      newItems.pop()
      setCoreSubjects(newItems);
    }

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
    if (electiveSubjects.length < 5) {
      const coresFromStore = coreSubjectsOptions.map((coreOpt) => {
        const savedResult = application?.coreResults?.find(
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
    }
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

  const handleAcademicProfileChange = (
    id: string,
    field: keyof Pick<
      AcademicProfile,
      "institutionAttended" | "basicQualification" | "startDate" | "endDate"
    >,
    value: string,
  ) => {
    setAcademicProfiles((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const addAcademicProfileRow = () => {
    setAcademicProfiles((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        institutionAttended: "",
        basicQualification: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };
  const removeAcademicProfileRow = (id: string) => {
    setAcademicProfiles((prev) => prev.filter((s) => s.id !== id));
  };

  const handleWorkExperienceChange = (
    id: string,
    field: keyof Pick<
      WorkExperience,
      "institutionWorked" | "jobTitle" | "startDate" | "endDate"
    >,
    value: string,
  ) => {
    setWorkExperience((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };
  const addWorkExperienceRow = () => {

    setWorkExperience((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        institutionWorked: "",
        jobTitle: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };
  const removeWorkExperienceRow = (id: string) => {
    setWorkExperience((prev) => prev.filter((s) => s.id !== id));
  };

  function hasDuplicates(arr: ElectiveSubjectLocal[]): boolean {
    const seen = new Set();
    for (const obj of arr) {
      const key = JSON.stringify(obj.id);
      if (seen.has(key)) {
        return true;
      }
      seen.add(key);
    }
    console.log(seen);
    return false;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (disable){
      onNext();
      return;
    }

    if (disable){
      onNext();
      return;
    }

    if (!applicationId) {
      toast.error("Application ID not found.");
      return;
    }

    if (hasDuplicates(electiveSubjects)){
      toast.error("You can not use the same elective subject more than once.");
      return;
    }

    const indexNumbers = new Set();
    electiveSubjects.forEach((subject) => {
      indexNumbers.add(subject.indexNumber)
    })
    coreSubjects.forEach((subject) => {
      indexNumbers.add(subject.indexNumber)
    })

    if (indexNumbers.size > 3){
      toast.error(`You can not use grades from more than 3 certificates. But your form shows ${indexNumbers.size} different index numbers.`)
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

    const mappedProfiles: AcademicProfileInput[] = academicProfiles
      .filter((s) => s.institutionAttended && s.basicQualification && s.startDate && s.endDate)
      .map((s) => ({
        institution: s.institutionAttended,
        qualification: s.basicQualification,
        startDate: new Date(s.startDate).getTime(),
        endDate: new Date(s.endDate).getTime(),
      }));

    const mappedExperiences: WorkExperienceInput[] = workExperience
      .filter((s) => s.institutionWorked && s.jobTitle && s.startDate && s.endDate)
      .map((s) => ({
        institution: s.institutionWorked,
        jobTitle: s.jobTitle,
        startDate: new Date(s.startDate).getTime(),
        endDate: new Date(s.endDate).getTime(),
      }));

    const examsTypeIsDirty = applicationType != application?.examinationType;
    if (!examsTypeIsDirty
        && areCoreResultsEqual(mappedCoreResults, application?.coreResults ?? [])
        && areElectivesResultsEqual(mappedElectiveResults, application?.electiveResults ?? [])
    ){
      onNext();
      return;
    }

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

    if (!isPostBasic && (!electivesComplete || !coresComplete)) {
      toast.error("Please fill required fields (Grade, Index, Year, Month) for every subject.");
      return;
    }

    const payload: Partial<ApplicationInput> = {
      examinationType: applicationType,
      electiveResults: mappedElectiveResults,
      academicProfiles: mappedProfiles, 
      workExperiences: mappedExperiences,
      coreResults: mappedCoreResults,
          registrationStage: mapStageToStepId(application?.registrationStage ?? "ACADEMIC_DETAILS") <= mapStageToStepId("ACADEMIC_DETAILS")
              ? "PERSONAL_DETAILS"
              :  application?.registrationStage,
    };

    const success = await updateApplication(payload);
    if (success) {
      onNext();
    }
  };

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
          { !isPostBasic && <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="application-type">
              Application Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={applicationType}
              onValueChange={setApplicationType}
              required
              disabled={isLoading || disable}
            >
              <SelectTrigger id="application-type" className="w-full focus:ring-green-500">
                <SelectValue placeholder="Select application type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WASSCE">WASSCE</SelectItem>
                <SelectItem value="SSSCE">SSSCE</SelectItem>
              </SelectContent>
            </Select>
          </div>}
          { !isPostBasic && <Separator />}

          { !isPostBasic &&<div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Provide the following information
              </h3>
              <CardDescription className="mb-4 text-sm">
                Note: You can not use grades from more than 3 certificates.
              </CardDescription>
              <CardDescription className="mb-4 text-sm">
                <Alert variant="filled" severity="error" className="mb-4">
                  <AlertTitle>Attention Science & Home Economics Students:</AlertTitle>
                  You may replace Integrated Science with either <strong>Biology</strong> or <strong>Additional Mathematics</strong> by additional elective subjects.
                </Alert>
              </CardDescription>
              <h4 className="text-base font-semibold text-gray-700 mb-1">
                Elective Subjects
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Input your best subjects and grades...
              </p>
            </div>
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
                  <div className="grid grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_auto] gap-4 items-stretch">
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
                        disabled={(isLoadingWaecCourses || isLoading) || disable}
                      >
                        <SelectTrigger
                          id={`waecCourse-${subject.id}`}
                          className="w-full focus:ring-green-500"
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
                          isLoading ||
                          disable
                        }
                      >
                        <SelectTrigger
                          id={`subject-${subject.id}`}
                          className="w-full focus:ring-green-500"
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
                        disabled={isLoading || disable}
                      >
                        <SelectTrigger
                          id={`grade-${subject.id}`}
                          className="w-full focus:ring-green-500"
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
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
                      />
                    </div>
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
                          disabled={isLoading || disable}
                        >
                          <SelectTrigger
                            aria-label="Exam Year"
                            className="w-full focus:ring-green-500"
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
                          disabled={isLoading || disable}
                        >
                          <SelectTrigger
                            aria-label="Exam Month"
                            className="w-full focus:ring-green-500"
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
                    <div className="flex justify-end items-end col-span-2 lg:col-span-1">
                      {electiveSubjects.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 h-9 w-9"
                          onClick={() => removeSubjectRow(subject.id)}
                          aria-label="Remove subject row"
                          disabled={isLoading || disable}
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
            {electiveSubjects.length < 4 && <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-green-700 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-800 hover:border-green-400"
                onClick={addSubjectRow}
                disabled={isLoading || disable}
              >
                {" "}
                <PlusCircle className="mr-2 h-4 w-4" /> Add Elective
                Subject{" "}
              </Button>
            </div>}
          </div>}

          { isPostBasic && <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Provide the following information
              </h3>
            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-1">
                Academic Profiles
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Input your past academic profiles...
              </p>
            </div>
            <div className="hidden lg:grid lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_auto] gap-x-4 px-1 pb-2 border-b">
              <Label>Instituition Attended</Label> <Label>Basic Qualification</Label>{" "}
              <Label>Start Date</Label> <Label>End Date</Label>{" "}
              <span className="sr-only">Actions</span>
            </div>
            <div className="space-y-5">
              {academicProfiles.map((academicProfile) => (
                <div
                  key={academicProfile.id}
                  className="border-b border-gray-200 pb-5 last:border-b-0 last:pb-0"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_auto] gap-4 items-stretch">
                  <div className="space-y-1.5">
                      <Label
                        htmlFor={`institutionAttended-${academicProfile.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Institution Attended
                      </Label>
                      <Input
                        id={`institutionAttended-${academicProfile.id}`}
                        type="text"
                        placeholder="Institution Attended..."
                        value={academicProfile.institutionAttended}
                        onChange={(e) =>
                          handleAcademicProfileChange(
                            academicProfile.id,
                            "institutionAttended",
                            e.target.value,
                          )
                        }
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`qualification-${academicProfile.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Basic Qualification
                      </Label>
                      <Input
                        id={`qualification-${academicProfile.id}`}
                        type="text"
                        placeholder="Basic Qualification..."
                        value={academicProfile.basicQualification}
                        onChange={(e) =>
                          handleAcademicProfileChange(
                            academicProfile.id,
                            "basicQualification",
                            e.target.value,
                          )
                        }
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`startDate-${academicProfile.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Start Date
                      </Label>
                      <Input
                        id={`startDate-${academicProfile.id}`}
                        type="date"
                        placeholder="Start Date..."
                        value={academicProfile.startDate}
                        onChange={(e) =>
                          handleAcademicProfileChange(
                            academicProfile.id,
                            "startDate",
                            e.target.value,
                          )
                        }
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`endDate-${academicProfile.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        End Date
                      </Label>
                      <Input
                        id={`endDate-${academicProfile.id}`}
                        type="date"
                        placeholder="End Date..."
                        value={academicProfile.endDate}
                        onChange={(e) =>
                          handleAcademicProfileChange(
                            academicProfile.id,
                            "endDate",
                            e.target.value,
                          )
                        }
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
                      />
                    </div>
                    <div className="flex justify-end items-end col-span-2 lg:col-span-1">
                      {academicProfiles.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 h-9 w-9"
                          onClick={() => removeAcademicProfileRow(academicProfile.id)}
                          aria-label="Remove academic profile"
                          disabled={isLoading || disable}
                        >
                          {" "}
                          <Trash2 className="h-4 w-4" />{" "}
                        </Button>
                      )}
                      {academicProfiles.length <= 1 && (
                        <div className="h-9 w-9"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {academicProfiles.length < 4 && <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-green-700 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-800 hover:border-green-400"
                onClick={addAcademicProfileRow}
                disabled={isLoading || disable}
              >
                {" "}
                <PlusCircle className="mr-2 h-4 w-4" /> Add Academic Profile
              </Button>
            </div>}
            <Separator />
            <div>
              <h4 className="text-base font-semibold text-gray-700 mb-1">
                Work Experiences
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Input your past work experiences...
              </p>
            </div>
            <div className="hidden lg:grid lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_auto] gap-x-4 px-1 pb-2 border-b">
              <Label>Instituition</Label> <Label>Job Title</Label>{" "}
              <Label>Start Date</Label> <Label>End Date</Label>{" "}
              <span className="sr-only">Actions</span>
            </div>
            <div className="space-y-5">
              {workExperience.map((experience) => (
                <div
                  key={experience.id}
                  className="border-b border-gray-200 pb-5 last:border-b-0 last:pb-0"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_auto] gap-4 items-stretch">
                  <div className="space-y-1.5">
                      <Label
                        htmlFor={`institutionAttended-${experience.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Institution Worked
                      </Label>
                      <Input
                        id={`institutionWorked-${experience.id}`}
                        type="text"
                        placeholder="Institution Worked in..."
                        value={experience.institutionWorked}
                        onChange={(e) =>
                          handleWorkExperienceChange(
                            experience.id,
                            "institutionWorked",
                            e.target.value,
                          )
                        }
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`jobTitle-${experience.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Basic Qualification
                      </Label>
                      <Input
                        id={`jobTitle-${experience.id}`}
                        type="text"
                        placeholder="Job title..."
                        value={experience.jobTitle}
                        onChange={(e) =>
                          handleWorkExperienceChange(
                            experience.id,
                            "jobTitle",
                            e.target.value,
                          )
                        }
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`startDate-${experience.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        Start Date
                      </Label>
                      <Input
                        id={`startDate-${experience.id}`}
                        type="date"
                        placeholder="Start Date..."
                        value={experience.startDate}
                        onChange={(e) =>
                          handleWorkExperienceChange(
                            experience.id,
                            "startDate",
                            e.target.value,
                          )
                        }
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`endDate-${experience.id}`}
                        className="text-sm font-medium text-gray-600 lg:hidden"
                      >
                        End Date
                      </Label>
                      <Input
                        id={`endDate-${experience.id}`}
                        type="date"
                        placeholder="End Date..."
                        value={experience.endDate}
                        onChange={(e) =>
                          handleWorkExperienceChange(
                            experience.id,
                            "endDate",
                            e.target.value,
                          )
                        }
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
                      />
                    </div>
                    <div className="flex justify-end items-end col-span-2 lg:col-span-1">
                      {academicProfiles.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 h-9 w-9"
                          onClick={() => removeWorkExperienceRow(experience.id)}
                          aria-label="Remove work experience"
                          disabled={isLoading || disable}
                        >
                          {" "}
                          <Trash2 className="h-4 w-4" />{" "}
                        </Button>
                      )}
                      {academicProfiles.length <= 1 && (
                        <div className="h-9 w-9"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {academicProfiles.length < 4 && <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-green-700 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-800 hover:border-green-400"
                onClick={addWorkExperienceRow}
                disabled={isLoading || disable}
              >
                {" "}
                <PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience
              </Button>
            </div>}
          </div>}

          <Separator />

          { !isPostBasic &&<div className="space-y-6">
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
              {coreSubjects.map((subject) => subject.subjectName === 'Science' && electiveSubjects.length < 3 ? (
                <div
                key={subject.id}
                className="border-b border-gray-200 pb-5 last:border-b-0 last:pb-0"
              >
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
                      disabled={isLoading || disable}
                    >
                      <SelectTrigger
                        id={`core-grade-${subject.id}`}
                        className="w-full focus:ring-green-500"
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
                      disabled={isLoading || disable}
                      className="w-full focus:ring-green-500"
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
                        disabled={isLoading || disable}
                      >
                        <SelectTrigger
                          aria-label="Core Exam Year"
                          className="w-full focus:ring-green-500"
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
                        disabled={isLoading || disable}
                      >
                        <SelectTrigger
                          aria-label="Core Exam Month"
                          className="w-full focus:ring-green-500"
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
              ) : (
                <div
                  key={subject.id}
                  className="border-b border-gray-200 pb-5 last:border-b-0 last:pb-0"
                >
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
                        disabled={isLoading || disable}
                      >
                        <SelectTrigger
                          id={`core-grade-${subject.id}`}
                          className="w-full focus:ring-green-500"
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
                        disabled={isLoading || disable}
                        className="w-full focus:ring-green-500"
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
                          disabled={isLoading || disable}
                        >
                          <SelectTrigger
                            aria-label="Core Exam Year"
                            className="w-full focus:ring-green-500"
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
                          disabled={isLoading || disable}
                        >
                          <SelectTrigger
                            aria-label="Core Exam Month"
                            className="w-full focus:ring-green-500"
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
          </div>}

          { !isPostBasic &&<Separator className="my-8" />}

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
