export interface FormData {
  // Step 1
  programType: string;
  institution: string;
  program: string;

  // Step 2
  applicationType: string;
  electiveSubjects: ElectiveSubject[];
  coreSubjects: CoreSubject[];

  // Step 3
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;
  birthPlace: string;
  country: string;
  nationality: string;
  birthRegion: string;
  birthDistrict: string;
  languagesSpoken: string;
  selectedConditions: string[];
  profilePhoto?: File | null;
  photoPreview?: string | null;
  address: string;
  city: string;
  contactRegion: string;
  contactDistrict: string;
  digitalAddress?: string;
  phone: string;
  email: string;
  parentName: string;
  parentContact: string;

  // Other potential fields
  applicationPin?: string;
  applicationStatus?: string;
}

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
  dateOfBirth?: number | null; // Timestamp
  placeOfBirth?: string | null;
  country?: string | null;
  nationality?: string | null;
  districtId?: number | null;
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
    | "COMPLETED"
    | string
    | null;
  submissionDate?: number | null; // Timestamp
  applicant?: ApplicantInput | null;
  electiveResults?: ElectiveResultInput[] | null;
  coreResults?: CoreResultInput[] | null;
}

interface ElectiveSubject {
  id: string;
  waecCourse: string;
  subject: string;
  grade: string;
  indexNumber: string;
  examYear: string;
  examMonth: string;
}
interface CoreSubject {
  id: string;
  subjectName: string;
  grade: string;
  indexNumber: string;
  examYear: string;
  examMonth: string;
}
