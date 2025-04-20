export interface FormData {
    // Step 1
    programType: string;
    institution: string;
    program: string;

    // Step 2
    applicationType: string; // WASSCE/SSSCE
    electiveSubjects: ElectiveSubject[]; // Array from AcademicDetailsForm
    coreSubjects: CoreSubject[]; // Array from AcademicDetailsForm

    // Step 3
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: string;
    dob: string; // YYYY-MM-DD
    birthPlace: string;
    country: string; // Country of Birth
    nationality: string;
    birthRegion: string;
    birthDistrict: string;
    languagesSpoken: string;
    selectedConditions: string[]; // Array of condition IDs
    profilePhoto?: File | null; // The File object
    photoPreview?: string | null; // The preview URL
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

interface ElectiveSubject { id: string; waecCourse: string; subject: string; grade: string; indexNumber: string; examYear: string; examMonth: string; }
interface CoreSubject { id: string; subjectName: string; grade: string; indexNumber: string; examYear: string; examMonth: string; }
