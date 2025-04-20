import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import Cookie from "js-cookie";

const baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nonAuthEndpoints: string[] = [
    '/api/v1.0/auth/login',
    '/api/v1.0/auth/admin/login',
    '/api/v1.0/auth/reset-password',
    '/api/v1.0/auth/reset-password-request',
    '/api/v1.0/auth/resend-email-verification-request',
    '/api/v1.0/public/make-payment',
    '/api/v1.0/public/check-status',
];

const axiosInstance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookie.get("accessToken");
        const isNonAuthEndpoint = nonAuthEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (token && !isNonAuthEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!error.response) {
            return Promise.reject(error);
        }

        const isNonAuthEndpoint = nonAuthEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));
        if ((error.response.status === 401 || error.response.status === 403) && !isNonAuthEndpoint && !originalRequest._retry) {

            originalRequest._retry = true;
            const refreshToken = Cookie.get("refreshToken");

            if (refreshToken) {
                // TODO: Implement token refresh logic here if/when an endpoint becomes available.
                // This would typically involve:
                // 1. Making a POST request to your refresh endpoint with the refreshToken.
                // 2. If successful, get new accessToken and potentially a new refreshToken.
                // 3. Update cookies using setAuthTokens(newAccessToken, newRefreshToken).
                // 4. Update the originalRequest header: originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                // 5. Retry the original request: return axiosInstance(originalRequest);
                // 6. If refresh fails (catch block), clear tokens and redirect/reject as below.

                // Since no refresh endpoint, treat as failure:
                clearAuthTokens();
                if (typeof window !== 'undefined') {
                    // Consider state management trigger instead of hard redirect
                    // window.location.href = '/login';
                }
                return Promise.reject(error); // Reject original error after clearing tokens

            } else {
                clearAuthTokens();
                if (typeof window !== 'undefined') {
                    // window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export const setAuthTokens = (accessToken: string, refreshToken: string): void => {
    try {
        const secure = process.env.NODE_ENV === 'production';
        Cookie.set("accessToken", accessToken, { expires: 1, secure: secure, sameSite: 'Lax', path: '/' });
        Cookie.set("refreshToken", refreshToken, { expires: 7, secure: secure, sameSite: 'Lax', path: '/' });
    } catch (error) {
        console.error("Error setting cookies:", error);
    }
};

export const clearAuthTokens = (): void => {
    try {
        Cookie.remove("accessToken", { path: '/' });
        Cookie.remove("refreshToken", { path: '/' });
    } catch (error) {
        console.error("Error removing cookies:", error);
    }
}

export default axiosInstance;
