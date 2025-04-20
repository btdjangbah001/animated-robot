"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const RegisterForm: React.FC = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Register
        </CardTitle>
        <CardDescription className="text-center text-black">
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-black">
                First Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-black" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder=""
                  required
                  className="pl-9 text-black placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-black">
                Last Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-black" />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder=""
                  required
                  className="pl-9 text-black placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ghanaCard" className="text-black">
              Ghana Card Number
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-black" />
              <Input
                id="ghana-card"
                name="ghanaCard"
                type="text"
                placeholder="e.g., GHA-XXXXXXXX-X"
                required
                className="pl-9 text-black placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-black">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-black" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="pl-9 text-black placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-black">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-black" />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Enter a valid phone number"
                required
                className="pl-9 text-black placeholder:text-gray-400"
                maxLength={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-black">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-black" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-9 text-black placeholder:text-gray-400"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-black hover:text-gray-600"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-black">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-black" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="pl-9 text-black placeholder:text-gray-400"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-black hover:text-gray-600"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full text-white">
            Create Account
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">
                Already have an account?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-200 text-black bg-gray-100 hover:bg-gray-200"
            onClick={() => router.push("/auth/login")}
          >
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
