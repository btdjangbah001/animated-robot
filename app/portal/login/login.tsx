"use client";
import * as React from "react";
import {Eye, EyeOff, Loader2} from "lucide-react";
import {useRouter} from 'next/navigation';
import useAuthStore from '@/store/authStore';
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {AxiosError} from "axios";
import {toast} from "react-toastify";

export const Login = () => {
    const [pin, setPin] = React.useState("");
    const [serial, setSerial] = React.useState("");
    const [showSerial, setShowSerial] = React.useState(false);

    const login = useAuthStore((state) => state.login);
    const isLoading = useAuthStore((state) => state.isLoading);
    const setError = useAuthStore((state) => state.setError);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const router = useRouter();

    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/portal/application');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        try {
            await login(pin, serial);
            router.push('/portal/application');

        } catch (err) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data?.message || err.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="p-6 pb-4">
                <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-md bg-green-100 text-green-800">
                        MOH
                    </span>
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                    Application Portal
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="pin" className="text-gray-700">
                            Pin <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="pin"
                            type="text"
                            placeholder="Enter your PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required
                            disabled={isLoading}
                            className="focus-visible:ring-green-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="serial" className="text-gray-700">
                            Serial <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="serial"
                                type={showSerial ? "text" : "password"}
                                placeholder="Enter your serial number"
                                value={serial}
                                onChange={(e) => setSerial(e.target.value)}
                                required
                                disabled={isLoading}
                                className="focus-visible:ring-green-500 pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent disabled:opacity-50"
                                onClick={() => setShowSerial(!showSerial)}
                                disabled={isLoading}
                                aria-label={showSerial ? "Hide serial number" : "Show serial number"}
                            >
                                {showSerial ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 bg-green-500 text-white hover:bg-green-600 disabled:opacity-75"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
