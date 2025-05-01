import {RegistrationStage} from "@/lib/consts";

export interface ProgramTypeOutput {
    id: number;
    title: string | null;
    description: string | null;
    postBasic: boolean | null;
}

export interface ProgramOutput {
    id: number;
    title: string | null;
    description: string | null;
    programTypeId: number | null;
    programType: ProgramTypeOutput | null;
}

export interface InstitutionOutput {
    id: number;
    name: string | null;
    description: string | null;
}

export interface SubjectOutput {
    id: number;
    name: string | null;
    core: boolean | null;
}

export interface WaecCourseOutput {
    id: number;
    name: string | null;
    description: string | null;
}

export interface RegionOutput {
    id: number;
    name: string | null;
}

export interface DistrictOutput {
    id: number;
    name: string | null;
    regionId: number | null;
    region?: RegionOutput | null;
}

export interface ContactInformationData {
    id?: number | null;
    address?: string | null;
    city?: string | null;
    districtId?: number | null;
    district?: DistrictOutput | null;
    digitalAddress?: string | null;
    contactPersonName?: string | null;
    contactPersonPhoneNUmber?: string | null;
}

export interface ApplicantOutput {
    isGhanaian: boolean | null;
    id: number;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    ghanaCardNumber: string | null;
    email: string | null;
    gender: "MALE" | "FEMALE" | string | null;
    dateOfBirth: number | null; // Timestamp
    placeOfBirth: string | null;
    country: string | null;
    nationality: string | null;
    districtId: number | null; // Birth District ID
    district?: DistrictOutput | null;
    languagesSpoken: string | null;
    medicalConditions: string | null;
    profilePhotoId: number | null;
    // profilePhoto?: { id: number; name: string | null; type: string | null; } | null;
    paid: boolean | null;
    transactionStatus: "PAID" | "FAILED" | "NO_RECORD" | "PENDING" | string | null;
    contactInformation: ContactInformationData | null;
    pin: string | null;
    serialNumber: string | null;
}

export interface CoreResultOutput {
    id: number;
    subjectId: number;
    grade: string | null;
    indexNumber: string | null;
    year: number | null;
    month: string | null;
    subject?: SubjectOutput | null;
}

export interface AcademicProfileOutput {
    id: number;
    institution: string | null;
    qualification: string | null;
    startDate: number | null;
    endDate: number | null;
}

export interface WorkExperienceOutput {
    id: number;
    institution: string | null;
    jobTitle: string | null;
    startDate: number | null;
    endDate: number | null;
}

export interface ElectiveResultOutput {
    id: number;
    subjectId: number;
    grade: string | null;
    indexNumber: string | null;
    year: number | null;
    month: string | null;
    courseId: number | null;
    subject: SubjectOutput | null;
    course: WaecCourseOutput | null;
}

export interface ApplicationOutput {
    id: number;
    institutionId: number | null;
    programId: number | null;
    institution: InstitutionOutput | null;
    program: ProgramOutput | null;
    examinationType: "WASSCE" | "SSSCE" | string | null;
    registrationStage: RegistrationStage;
    submissionDate: number | null; // Timestamp
    applicant: ApplicantOutput | null;
    electiveResults: ElectiveResultOutput[] | null;
    coreResults: CoreResultOutput[] | null;
    academicProfiles: AcademicProfileOutput[] | null;
    workExperiences: WorkExperienceOutput[] | null;
    applicationPin?: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED" | "IN_REVIEW" | "NEW" | "FAILED_ELIGIBILITY" | "PASSED_ELIGIBILITY" | "INTERVIEW_SCHEDULED" | null;
    aggregateGrade?: number | string | null;
}

export interface SettingsOutput {
    startingDate: number;
    closingDate: number;
}

export type ApplicantData = ApplicantOutput;

