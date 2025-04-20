export interface ContactInformationData {
    id?: number | null;
    address?: string | null;
    city?: string | null;
    districtId?: number | null;
    digitalAddress?: string | null;
    contactPersonName?: string | null;
    contactPersonPhoneNUmber?: string | null;
}

export interface ApplicantOutput {
    id: number;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    ghanaCardNumber: string | null;
    gender: "MALE" | "FEMALE" | string | null;
    dateOfBirth: number | null; // Timestamp
    placeOfBirth: string | null;
    country: string | null;
    nationality: string | null;
    districtId: number | null;
    languagesSpoken: string | null;
    medicalConditions: string | null;
    profilePhotoId: number | null;
    paid: boolean;
    transactionStatus: "PAID" | "FAILED" | "NO_RECORD" | "PENDING" | string | null;
    contactInformation: ContactInformationData | null;
}

export interface CoreResultOutput {
    id: number;
    subjectId: number;
    grade: "A1" | "B2" | "B3" | "C4" | "C5" | "C6" | "D7" | "D8" | string;
    indexNumber: string;
    year: number;
    month: string;
}

interface ElectiveResultOutput {
    id: number;
    subjectId: number;
    grade: "A1" | "B2" | "B3" | "C4" | "C5" | "C6" | "D7" | "D8" | string;
    indexNumber: string;
    year: number;
    month: string;
    courseId: number;
}

export interface ApplicationOutput {
    id: number;
    institutionId: number;
    programId: number;
    examinationType: "WASSCE" | "SSSCE" | string;
    registrationStage: "PROGRAM_DETAILS" | "ACADEMIC_DETAILS" | "PERSONAL_DETAILS" | "COMPLETED" | string;
    submissionDate: number | null; // Timestamp
    applicant: ApplicantOutput;
    electiveResults: ElectiveResultOutput[] | null;
    coreResults: CoreResultOutput[] | null;
}

export type ApplicantData = ApplicantOutput;
