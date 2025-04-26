export interface ContactInformationInput {
  address?: string | null;
  city?: string | null;
  districtId?: number | null;
  phoneNumber: string | null;
  email: string | null;
  digitalAddress?: string | null;
  contactPersonName?: string | null;
  contactPersonPhoneNUmber?: string | null;
}

export interface ApplicantInput {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  ghanaCardNumber?: string | null;
  email?: string | null;
  gender?: "MALE" | "FEMALE" | string | null;
  dateOfBirth?: number | null;
  placeOfBirth?: string | null;
  country?: string | null;
  nationality?: string | null;
  languagesSpoken?: string | null;
  medicalConditions?: string | null;
  profilePhotoId?: number | null;
  contactInformation?: ContactInformationInput | null;
}

export interface CoreResultInput {
  subjectId: number;
  grade: "A1" | "B2" | "B3" | "C4" | "C5" | "C6" | "D7" | "D8" | string;
  indexNumber: string;
  year: number;
  month: string;
}

export interface ElectiveResultInput {
  subjectId: number;
  grade: "A1" | "B2" | "B3" | "C4" | "C5" | "C6" | "D7" | "D8" | string;
  indexNumber: string;
  year: number;
  month: string;
  courseId: number;
}

export interface ApplicationInput {
  institutionId?: number | null;
  programId?: number | null;
  examinationType?: "WASSCE" | "SSSCE" | string | null;
  registrationStage?:
    | "PROGRAM_DETAILS"
    | "ACADEMIC_DETAILS"
    | "PERSONAL_DETAILS"
    | "DRAFT"
    | "SUBMITTED"
  applicant?: ApplicantInput | null;
  electiveResults?: ElectiveResultInput[] | null;
  coreResults?: CoreResultInput[] | null;
}
