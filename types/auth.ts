import {ApplicantOutput} from "@/types/applicant";

export interface LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    user: ApplicantOutput;
}
