import {create} from 'zustand';
import axiosInstance from '@/lib/axios';
import {AxiosError} from 'axios';
import {ApplicantOutput, ApplicationOutput, SubjectOutput} from "@/types/applicant";
import {ApplicantInput, ApplicationInput} from "@/types/application";

interface OptionType {
    id: number;
    title?: string;
    name?: string;
}

interface ApplicationState {
    application: ApplicationOutput | null;
    applicationId: number | null;
    isLoading: boolean;
    error: string | null;
    programTypes: OptionType[];
    institutions: OptionType[];
    programs: OptionType[];
    isLoadingProgramTypes: boolean;
    isLoadingInstitutions: boolean;
    isLoadingPrograms: boolean;
    dropdownError: string | null;
    waecCourses: OptionType[];
    isLoadingWaecCourses: boolean;
    coreSubjectsOptions: SubjectOutput[];
    isLoadingCoreSubjects: boolean;
}

interface ApplicationActions {
    fetchApplication: () => Promise<void>;
    updateApplication: (payload: Partial<ApplicationInput>) => Promise<boolean>;
    updateApplicantDetails: (payload: ApplicantInput) => Promise<boolean>;
    saveFile: (name: string) => Promise<any>;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearApplication: () => void;
    // New actions for dropdowns
    fetchProgramTypes: () => Promise<void>;
    fetchInstitutions: (programTypeId: number | string) => Promise<void>;
    fetchPrograms: (programTypeId: number | string, institutionId: number | string) => Promise<void>;
    clearInstitutions: () => void;
    clearPrograms: () => void;
    fetchWaecCourses: () => Promise<void>;
    fetchCoreSubjects: () => Promise<void>;
}

interface ApplicationStore extends ApplicationState, ApplicationActions {}

const useApplicationStore = create<ApplicationStore>((set, get) => ({
    application: null,
    applicationId: null,
    isLoading: false,
    error: null,
    programTypes: [],
    institutions: [],
    programs: [],
    isLoadingProgramTypes: false,
    isLoadingInstitutions: false,
    isLoadingPrograms: false,
    dropdownError: null,
    waecCourses: [],
    isLoadingWaecCourses: false,
    coreSubjectsOptions: [],
    isLoadingCoreSubjects: false,

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearApplication: () => set({
        application: null, applicationId: null, isLoading: false, error: null,
        programTypes: [], institutions: [], programs: [], dropdownError: null,
        isLoadingProgramTypes: false, isLoadingInstitutions: false, isLoadingPrograms: false,
        coreSubjectsOptions: [], isLoadingCoreSubjects: false
    }),

    fetchApplication: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get<ApplicationOutput>('/api/v1.0/applications');
            const appData = response.data;
            set({
                application: appData,
                applicationId: appData?.id ?? null,
                isLoading: false,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            set({ isLoading: false, error: "Failed to load application data.", application: null, applicationId: null });
        }
    },

    updateApplication: async (payload: Partial<ApplicantOutput>): Promise<boolean> => {
        const currentId = get().applicationId;
        if (!currentId) {
            set({ error: "Application ID is missing. Cannot update." });
            return false;
        }
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.put(`/api/v1.0/applications/${currentId}`, payload);
            await get().fetchApplication();
            set({ isLoading: false });
            return true;
        } catch (error) {
            let message = "Failed to save application progress.";
            if (error instanceof AxiosError && error.response?.data?.message) {
                message = error.response.data.message;
            }
            set({ isLoading: false, error: message });
            return false;
        }
    },

    saveFile: async (name: String): Promise<any> => {
        set({ isLoading: true, error: null });
        try {
            const presignResponse = await axiosInstance.post(
                "/api/v1.0/files/upload",
                { name: name },
              );
            set({ isLoading: false });
            return presignResponse.data;
        } catch (error) {
            let message = "Failed to save file progress.";
            if (error instanceof AxiosError && error.response?.data?.message) {
                message = error.response.data.message;
            }
            set({ isLoading: false, error: message });
            return null;
        }
    },

    updateApplicantDetails: async (payload: ApplicantInput): Promise<boolean> => {
        const applicantId = get().application?.applicant?.id;
        if (!applicantId) { set({ error: "Applicant ID is missing. Cannot update details." }); return false; }
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.put(`/api/v1.0/applicants/${applicantId}`, payload);
            await get().fetchApplication();
            set({ isLoading: false });
            return true;
        } catch (error) {
            let message = "Failed to save personal details.";
            if (error instanceof AxiosError && error.response?.data?.message) { message = error.response.data.message; }
            set({ isLoading: false, error: message });
            return false;
        }
    },

    fetchProgramTypes: async () => {
        set({ isLoadingProgramTypes: true, dropdownError: null });
        try {
            const response = await axiosInstance.post('/api/v1.0/program-types/search', {}, { params: { size: 100 } });
            set({ programTypes: response.data?.content || [], isLoadingProgramTypes: false });
        } catch (error) {
            set({ isLoadingProgramTypes: false, dropdownError: "Failed to load program types." });
        }
    },

    fetchInstitutions: async (programTypeId) => {
        if (!programTypeId) return;
        set({ isLoadingInstitutions: true, institutions: [], programs: [], dropdownError: null });
        try {
            const response = await axiosInstance.get(`/api/v1.0/institutions/by-program-type/${Number(programTypeId)}`);
            set({ institutions: response.data || [], isLoadingInstitutions: false });
        } catch (error) {
            set({ isLoadingInstitutions: false, dropdownError: "Failed to load institutions." });
        }
    },

    fetchPrograms: async (programTypeId, institutionId) => {
        if (!programTypeId || !institutionId) return;
        set({ isLoadingPrograms: true, programs: [], dropdownError: null });
        try {
            const response = await axiosInstance.get(`/api/v1.0/programs/by-program-type/${Number(programTypeId)}/institution/${Number(institutionId)}`);
            set({ programs: response.data || [], isLoadingPrograms: false });
        } catch (error) {
            set({ isLoadingPrograms: false, dropdownError: "Failed to load programs." });
        }
    },

    clearInstitutions: () => set({ institutions: [], programs: [] }),
    clearPrograms: () => set({ programs: [] }),

    fetchWaecCourses: async () => {
        set({ isLoadingWaecCourses: true, dropdownError: null });
        try {
            const response = await axiosInstance.post('/api/v1.0/waec-courses/search', {}, { params: { size: 100 } });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedCourses = response.data?.content?.map((c: any) => ({ id: c.id, title: c.name })) || [];
            set({ waecCourses: formattedCourses, isLoadingWaecCourses: false });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            set({ isLoadingWaecCourses: false, dropdownError: "Failed to load WAEC courses." });
        }
    },

    fetchCoreSubjects: async () => {
        set({ isLoadingCoreSubjects: true, dropdownError: null });
        try {
            const queryPayload = {
                where: [{ leftHand: {value: "core"}, matchMode: "EQUAL", rightHand: {value: "true"}, operator: "AND" } ]
            };
            const response = await axiosInstance.post('/api/v1.0/subjects/search', queryPayload, { params: { size: 10 } });
            set({ coreSubjectsOptions: response.data?.content || [], isLoadingCoreSubjects: false });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            set({ isLoadingCoreSubjects: false, dropdownError: "Failed to load core subjects." });
        }
    },

}));

export default useApplicationStore;
