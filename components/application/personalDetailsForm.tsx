"use client";

import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Paperclip,
  User as UserIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useApplicationStore from "@/store/applicationStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApplicantInput, ApplicationInput } from "@/types/application";
import axiosInstance from "@/lib/axios";
import { DistrictOutput, RegionOutput } from "@/types/applicant";
import { nationalities } from "@/lib/consts";

interface PersonalDetailsFormProps {
  onNext: () => void;
  onBack: () => void;
}

interface PersonalDetailsState {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  birthPlace: string;
  country: string;
  nationality: string;
  birthRegionId: string;
  birthDistrictId: string;
  languagesSpoken: string;
  selectedConditions: string[];
  address: string;
  city: string;
  contactRegionId: string;
  contactDistrictId: string;
  digitalAddress: string;
  phone: string;
  email: string;
  parentName: string;
  parentContact: string;
}

const genderOptions = ["MALE", "FEMALE"];
const nationalityOptions = nationalities;
const medicalConditions = [
  { id: "none", label: "None" },
  { id: "deaf", label: "DEAF" },
  { id: "dumb", label: "DUMB" },
  { id: "deaf-dumb", label: "DEAF and DUMB" },
  { id: "blind-1", label: "BLIND (1 Eye)" },
  { id: "deaf-1", label: "DEAF (1 Ear)" },
  { id: "crippled", label: "CRIPPLED" },
  { id: "amputee", label: "AMPUTEE" },
  { id: "blind", label: "BLIND" },
];

const initialFormState: PersonalDetailsState = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dob: "",
  birthPlace: "",
  country: "",
  nationality: "",
  birthRegionId: "",
  birthDistrictId: "",
  languagesSpoken: "",
  selectedConditions: ["none"],
  address: "",
  city: "",
  contactRegionId: "",
  contactDistrictId: "",
  digitalAddress: "",
  phone: "",
  email: "",
  parentName: "",
  parentContact: "",
};

export function PersonalDetailsForm({
  onNext,
  onBack,
}: PersonalDetailsFormProps) {
  const [formState, setFormState] =
    useState<PersonalDetailsState>(initialFormState);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialValues, setInitialValues] =
    useState<PersonalDetailsState | null>(null);

  const [allRegions, setAllRegions] = useState<RegionOutput[]>([]);
  const [birthDistrictOptions, setBirthDistrictOptions] = useState<
    DistrictOutput[]
  >([]);
  const [contactDistrictOptions, setContactDistrictOptions] = useState<
    DistrictOutput[]
  >([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingBirthDistricts, setLoadingBirthDistricts] = useState(false);
  const [loadingContactDistricts, setLoadingContactDistricts] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const application = useApplicationStore((state) => state.application);
  const applicationId = useApplicationStore((state) => state.applicationId);
  const updateApplicantDetails = useApplicationStore(
    (state) => state.updateApplication,
  );
  const isLoading = useApplicationStore((state) => state.isLoading);
  const error = useApplicationStore((state) => state.error);
  const setError = useApplicationStore((state) => state.setError);

  const fetchRegions = useCallback(async () => {
    setLoadingRegions(true);
    setLocalError(null);
    try {
      const response = await axiosInstance.post(
        "/api/v1.0/regions/search",
        {},
        { params: { size: 50 } },
      );
      setAllRegions(response.data?.content || []);
    } catch (err) {
      console.error("Failed to fetch regions:", err);
      setLocalError("Failed to load regions.");
    } finally {
      setLoadingRegions(false);
    }
  }, []);

  const fetchDistricts = useCallback(
    async (regionId: string, type: "birth" | "contact") => {
      if (!regionId) return;
      const setLoading =
        type === "birth"
          ? setLoadingBirthDistricts
          : setLoadingContactDistricts;
      const setOptions =
        type === "birth" ? setBirthDistrictOptions : setContactDistrictOptions;
      setLoading(true);
      setOptions([]);
      setLocalError(null);
      try {
        const payload = {
          where: { field: "regionId", operator: "eq", value: Number(regionId) },
        };
        const response = await axiosInstance.post(
          "/api/v1.0/districts/search",
          payload,
          { params: { size: 200 } },
        );
        setOptions(response.data?.content || []);
      } catch (err) {
        console.error(`Failed to fetch ${type} districts:`, err);
        setLocalError(`Failed to load ${type} districts.`);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (formState.birthRegionId)
      fetchDistricts(formState.birthRegionId, "birth");
    else setBirthDistrictOptions([]);
  }, [formState.birthRegionId, fetchDistricts]);

  useEffect(() => {
    if (formState.contactRegionId)
      fetchDistricts(formState.contactRegionId, "contact");
    else setContactDistrictOptions([]);
  }, [formState.contactRegionId, fetchDistricts]);

  const fetchPhotoPreviewUrl = useCallback(async (photoId: number) => {
    if (!photoId) return;
    setIsFetchingPreview(true);
    try {
      const response = await axiosInstance.post(
        `/api/v1.0/files/download/${photoId}`,
      );
      setPhotoPreview(response.data?.signedUrl || null);
    } catch (fetchError) {
      console.error("Failed to fetch photo preview URL:", fetchError);
      setPhotoPreview(null);
    } finally {
      setIsFetchingPreview(false);
    }
  }, []);

  useEffect(() => {
    if (application?.applicant) {
      const app = application.applicant;
      const contact = app.contactInformation;
      const conditions = app.medicalConditions
        ? app.medicalConditions
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];
      const birthRegionIdStr = app.district?.regionId?.toString() ?? "";
      const birthDistrictIdStr = app.districtId?.toString() ?? "";
      const contactRegionIdStr = contact?.district?.regionId?.toString() ?? "";
      const contactDistrictIdStr = contact?.districtId?.toString() ?? "";

      const loadedState: PersonalDetailsState = {
        firstName: app.firstName || "",
        middleName: app.middleName || "",
        lastName: app.lastName || "",
        gender: app.gender || "",
        dob: app.dateOfBirth
          ? format(new Date(app.dateOfBirth), "yyyy-MM-dd")
          : "",
        birthPlace: app.placeOfBirth || "",
        country: app.country || "",
        nationality: app.nationality || "",
        birthRegionId: birthRegionIdStr,
        birthDistrictId: birthDistrictIdStr,
        languagesSpoken: app.languagesSpoken || "",
        selectedConditions: conditions.length > 0 ? conditions : ["none"],
        address: contact?.address || "",
        city: contact?.city || "",
        contactRegionId: contactRegionIdStr,
        contactDistrictId: contactDistrictIdStr,
        digitalAddress: contact?.digitalAddress || "",
        phone: app.phoneNumber || "",
        email: app.email || "",
        parentName: contact?.contactPersonName || "",
        parentContact: contact?.contactPersonPhoneNUmber || "",
      };

      setFormState(loadedState);
      setInitialValues(JSON.parse(JSON.stringify(loadedState)));

      setProfilePhoto(null);
      if (app.profilePhotoId) {
        fetchPhotoPreviewUrl(app.profilePhotoId);
      } else {
        setPhotoPreview(null);
      }
    } else {
      setFormState(initialFormState);
      setInitialValues(null);
      setPhotoPreview(null);
      setProfilePhoto(null);
    }
  }, [application, fetchPhotoPreviewUrl]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    name: keyof Omit<PersonalDetailsState, "selectedConditions">,
    value: string,
  ) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (name === "birthRegionId")
      setFormState((prev) => ({ ...prev, birthDistrictId: "" }));
    if (name === "contactRegionId")
      setFormState((prev) => ({ ...prev, contactDistrictId: "" }));
  };

  const handleConditionChange = (
    checked: boolean | "indeterminate",
    conditionId: string,
  ) => {
    setFormState((prev) => {
      const currentSelection = prev.selectedConditions;
      if (conditionId === "none") {
        return { ...prev, selectedConditions: checked ? ["none"] : [] };
      } else {
        const otherConditions = currentSelection.filter((id) => id !== "none");
        let updated: string[];
        if (checked) {
          updated = [...otherConditions, conditionId];
        } else {
          updated = otherConditions.filter((id) => id !== conditionId);
        }
        return {
          ...prev,
          selectedConditions: updated.length === 0 ? ["none"] : updated,
        };
      }
    });
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) {
        alert("File is too large! Maximum size is 200KB.");
        event.target.value = "";
        return;
      }
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setProfilePhoto(null);
      if (application?.applicant?.profilePhotoId) {
        fetchPhotoPreviewUrl(application.applicant.profilePhotoId);
      } else {
        setPhotoPreview(null);
      }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setProfilePhoto(null);
    if (application?.applicant?.profilePhotoId) {
      fetchPhotoPreviewUrl(application.applicant.profilePhotoId);
    } else {
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBack = () => {
    onBack();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLocalError(null);
    if (!applicationId || !application?.applicant?.id) {
      setError("Application/Applicant ID not found.");
      return;
    }

    const isPhotoDirty = profilePhoto !== null;
    let isFormDirty = false;
    if (initialValues) {
      isFormDirty = JSON.stringify(formState) !== JSON.stringify(initialValues);
    } else {
      isFormDirty = Object.values(formState).some((value) => {
        if (Array.isArray(value))
          return value.length > 0 && (value.length > 1 || value[0] !== "none");
        return value !== "" && value !== null;
      });
    }
    const isDirty = isPhotoDirty || isFormDirty;

    if (!isDirty) {
      onNext();
      return;
    }

    let profilePhotoIdToSubmit: number | null =
      application.applicant.profilePhotoId ?? null;

    if (profilePhoto) {
      try {
        const presignResponse = await axiosInstance.post(
          "/api/v1.0/files/upload",
          { name: profilePhoto.name },
        );
        const { id: newPhotoId, signedUrl } = presignResponse.data;
        console.log(presignResponse.data);
        if (!signedUrl || !newPhotoId)
          throw new Error("Failed to get photo upload destination.");
        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": profilePhoto.type },
          body: profilePhoto,
        });
        if (!uploadResponse.ok) throw new Error("Failed to upload photo.");
        profilePhotoIdToSubmit = newPhotoId;
        setError(null);
      } catch (uploadError: any) {
        setError(
          `Photo upload failed: ${uploadError.message || "Please try again."}`,
        );
        return;
      }
    }

    const applicantPayload: ApplicantInput = {
      firstName: formState.firstName || null,
      middleName: formState.middleName || null,
      lastName: formState.lastName || null,
      phoneNumber: formState.phone || null,
      email: formState.email || null,
      gender: formState.gender || null,
      dateOfBirth: formState.dob ? new Date(formState.dob).getTime() : null,
      placeOfBirth: formState.birthPlace || null,
      country: formState.country || null,
      nationality: formState.nationality || null,
      districtId: formState.birthDistrictId
        ? Number(formState.birthDistrictId)
        : null,
      languagesSpoken: formState.languagesSpoken || null,
      medicalConditions: formState.selectedConditions.includes("none")
        ? null
        : formState.selectedConditions.join(", "),
      profilePhotoId: profilePhotoIdToSubmit,
      contactInformation: {
        address: formState.address || null,
        city: formState.city || null,
        districtId: formState.contactDistrictId
          ? Number(formState.contactDistrictId)
          : null,
        digitalAddress: formState.digitalAddress || null,
        contactPersonName: formState.parentName || null,
        contactPersonPhoneNUmber: formState.parentContact || null,
        phoneNumber: formState.phone,
        email: formState.email,
      },
    };

    const payload: Partial<ApplicationInput> = {
      applicant: applicantPayload,
      registrationStage: "COMPLETED",
    };

    const success = await updateApplicantDetails(payload);
    if (success) {
      setInitialValues(JSON.parse(JSON.stringify(formState)));
      setProfilePhoto(null);
      onNext();
    }
  };

  const displayError = error || localError;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        {" "}
        <CardTitle className="text-xl font-semibold text-gray-900">
          {" "}
          Personal details{" "}
        </CardTitle>{" "}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              {" "}
              <AlertTitle>Error</AlertTitle>{" "}
              <AlertDescription>{displayError}</AlertDescription>{" "}
            </Alert>
          )}

          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formState.firstName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                name="middleName"
                value={formState.middleName}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formState.lastName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                name="gender"
                value={formState.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
                required
                disabled={isLoading}
              >
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formState.dob}
                onChange={handleInputChange}
                required
                className="block w-full"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthPlace">
                Birth Place (Town/City) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="birthPlace"
                name="birthPlace"
                value={formState.birthPlace}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">
                Country of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                name="country"
                value={formState.country}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nationality">
                Nationality <span className="text-red-500">*</span>
              </Label>
              <Select
                name="nationality"
                value={formState.nationality}
                onValueChange={(value) =>
                  handleSelectChange("nationality", value)
                }
                required
                disabled={isLoading}
              >
                <SelectTrigger id="nationality" className="w-full">
                  <SelectValue placeholder="Select Nationality" />
                </SelectTrigger>
                <SelectContent>
                  {nationalityOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthRegionId">
                Region of Birth <span className="text-red-500">*</span>
              </Label>
              <Select
                name="birthRegionId"
                value={formState.birthRegionId}
                onValueChange={(value) =>
                  handleSelectChange("birthRegionId", value)
                }
                required
                disabled={isLoading || loadingRegions}
              >
                <SelectTrigger id="birthRegionId" className="w-full">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  {loadingRegions ? (
                    <SelectItem value="load" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    allRegions.map((o) => (
                      <SelectItem key={o.id} value={o.id.toString()}>
                        {o.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthDistrictId">
                District of Birth <span className="text-red-500">*</span>
              </Label>
              <Select
                name="birthDistrictId"
                value={formState.birthDistrictId}
                onValueChange={(value) =>
                  handleSelectChange("birthDistrictId", value)
                }
                required
                disabled={
                  isLoading || loadingBirthDistricts || !formState.birthRegionId
                }
              >
                <SelectTrigger id="birthDistrictId" className="w-full">
                  <SelectValue
                    placeholder={
                      !formState.birthRegionId
                        ? "Select region first"
                        : "Select District"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {loadingBirthDistricts ? (
                    <SelectItem value="load" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    birthDistrictOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id.toString()}>
                        {o.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="languages">
                Languages Spoken <span className="text-red-500">*</span>
              </Label>
              <Input
                id="languages"
                name="languagesSpoken"
                value={formState.languagesSpoken}
                onChange={handleInputChange}
                required
                placeholder="e.g. English, Twi"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Label className="text-base font-medium text-gray-700">
              Medical Condition / Disability{" "}
              <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">{`Please select any conditions that apply. Select "None" if none apply.`}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 pt-1">
              {medicalConditions.map((condition) => (
                <div key={condition.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition.id}`}
                    checked={formState.selectedConditions.includes(
                      condition.id,
                    )}
                    onCheckedChange={(checked) =>
                      handleConditionChange(checked, condition.id)
                    }
                    disabled={
                      isLoading ||
                      (condition.id !== "none" &&
                        formState.selectedConditions.includes("none"))
                    }
                  />
                  <Label
                    htmlFor={`condition-${condition.id}`}
                    className={cn(
                      "text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                      condition.id !== "none" &&
                        formState.selectedConditions.includes("none") &&
                        "text-gray-400",
                    )}
                  >
                    {" "}
                    {condition.label}{" "}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <Label className="font-medium text-gray-700">
                Profile Photo <span className="text-red-500">*</span>{" "}
                <span className="text-gray-500 text-sm font-normal">
                  [Max size: 200KB]
                </span>
              </Label>
              <Input
                id="profilePhotoInput"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handlePhotoChange}
                ref={fileInputRef}
                className="hidden"
                required={!profilePhoto && !photoPreview}
                disabled={isLoading}
              />
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFileButtonClick}
                  disabled={isLoading}
                >
                  {" "}
                  <Paperclip className="mr-2 h-4 w-4" /> Choose File{" "}
                </Button>
                {profilePhoto && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded">
                    {" "}
                    <span className="truncate max-w-[150px]">
                      {profilePhoto.name}
                    </span>{" "}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-red-600"
                      onClick={clearFile}
                      aria-label="Remove file"
                      disabled={isLoading}
                    >
                      {" "}
                      <X className="h-4 w-4" />{" "}
                    </Button>{" "}
                  </div>
                )}
                {!profilePhoto && !photoPreview && (
                  <span className="text-sm text-gray-500">No file chosen</span>
                )}
                {!profilePhoto && photoPreview && (
                  <span className="text-sm text-gray-500">
                    Current photo loaded. Choose file to replace.
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <Avatar className="h-28 w-28 border">
                {" "}
                <AvatarImage
                  src={photoPreview ?? undefined}
                  alt="Photo preview"
                />{" "}
                <AvatarFallback
                  className={cn(isFetchingPreview && "animate-pulse")}
                >
                  {" "}
                  <UserIcon className="h-12 w-12 text-gray-400" />{" "}
                </AvatarFallback>{" "}
              </Avatar>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address">
                  Residential Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formState.address}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">
                  City / Town <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formState.city}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactRegionId">
                  Region <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="contactRegionId"
                  value={formState.contactRegionId}
                  onValueChange={(value) =>
                    handleSelectChange("contactRegionId", value)
                  }
                  required
                  disabled={isLoading || loadingRegions}
                >
                  <SelectTrigger id="contactRegionId" className="w-full">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingRegions ? (
                      <SelectItem value="load" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      allRegions.map((o) => (
                        <SelectItem key={o.id} value={o.id.toString()}>
                          {o.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactDistrictId">
                  District <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="contactDistrictId"
                  value={formState.contactDistrictId}
                  onValueChange={(value) =>
                    handleSelectChange("contactDistrictId", value)
                  }
                  required
                  disabled={
                    isLoading ||
                    loadingContactDistricts ||
                    !formState.contactRegionId
                  }
                >
                  <SelectTrigger id="contactDistrictId" className="w-full">
                    <SelectValue
                      placeholder={
                        !formState.contactRegionId
                          ? "Select region first"
                          : "Select District"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingContactDistricts ? (
                      <SelectItem value="load" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      contactDistrictOptions.map((o) => (
                        <SelectItem key={o.id} value={o.id.toString()}>
                          {o.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="digitalAddress">Digital Address</Label>
                <Input
                  id="digitalAddress"
                  name="digitalAddress"
                  value={formState.digitalAddress}
                  onChange={handleInputChange}
                  placeholder="e.g. GA-123-4567"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  Primary Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formState.phone}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Parent/Guardian/Next of Kin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="parentName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parentName"
                  name="parentName"
                  value={formState.parentName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parentContact">
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="parentContact"
                  name="parentContact"
                  type="tel"
                  value={formState.parentContact}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
            >
              {" "}
              <ArrowLeft className="mr-2 h-4 w-4" /> Back{" "}
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600"
              disabled={isLoading}
            >
              {" "}
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              Next <ArrowRight className="ml-2 h-4 w-4" />{" "}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
