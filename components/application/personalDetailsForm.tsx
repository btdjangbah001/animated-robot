"use client";

import React, {ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState,} from "react";
import {ArrowLeft, ArrowRight, Loader2, Paperclip, User as UserIcon, X,} from "lucide-react";
import {format} from "date-fns";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Checkbox} from "@/components/ui/checkbox";
import {Separator} from "@/components/ui/separator";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import useApplicationStore from "@/store/applicationStore";
import {ApplicantInput} from "@/types/application";
import axiosInstance from "@/lib/axios";
import {DistrictOutput, RegionOutput} from "@/types/applicant";
import {countries, mapStageToStepId, nationalities} from "@/lib/consts";
import {toast} from "react-toastify";

interface PersonalDetailsFormProps {
  onNext: () => void;
  onBack: () => void;
}

interface PersonalDetailsState {
  firstName: string;
  lastName: string;
  isForeigner: boolean | "indeterminate";
  gender: string;
  dob: string;
  birthPlace: string;
  country: string;
  nationality: string;
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
  ghanaCardNumber: string;
}

const genderOptions: ("MALE" | "FEMALE")[] = ["MALE", "FEMALE"];
const nationalityOptions = nationalities;
const countryOptions = countries;
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
  lastName: "",
  isForeigner: "indeterminate",
  gender: "",
  dob: "",
  birthPlace: "",
  country: "",
  nationality: "",
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
  ghanaCardNumber: "",
};

const TARGET_ASPECT_RATIO = 175 / 225; // 35x45
const ASPECT_RATIO_TOLERANCE = 0.1;

const GHANA_CARD_REGEX = /^[A-Z]{3}-\d{9}-\d$/;
const PHONE_REGEX = /^0\d{9}$/;

export function PersonalDetailsForm({
  onNext,
  onBack,
}: PersonalDetailsFormProps) {
  const application = useApplicationStore((state) => state.application);
  const [formState, setFormState] =
    useState<PersonalDetailsState>({...initialFormState,
      contactDistrictId: application?.applicant?.contactInformation?.district?.id?.toString() ?? "",
      contactRegionId: application?.applicant?.contactInformation?.district?.regionId?.toString() ?? "",
      gender: application?.applicant?.gender ?? "",
      nationality: application?.applicant?.nationality ?? "",
      country: application?.applicant?.country ?? "",
    });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialValues, setInitialValues] =
    useState<PersonalDetailsState | null>(null);

  const [allRegions, setAllRegions] = useState<RegionOutput[]>([]);
  const [contactDistrictOptions, setContactDistrictOptions] = useState<
    DistrictOutput[]
  >([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingContactDistricts, setLoadingContactDistricts] = useState(false);

  const applicationId = useApplicationStore((state) => state.applicationId);
  const updateApplicantDetails = useApplicationStore(
    (state) => state.updateApplicantDetails,
  );
  const updateApplication = useApplicationStore(state => state.updateApplication)
  const setLoading = useApplicationStore(state => state.setLoading)
  const isLoading = useApplicationStore((state) => state.isLoading);
  const error = useApplicationStore((state) => state.error);
  const setError = useApplicationStore((state) => state.setError);
  const disable = application?.registrationStage === "SUBMITTED";
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchRegions = useCallback(async () => {
    setLoadingRegions(true);
    try {
      const response = await axiosInstance.post(
        "/api/v1.0/regions/search",
        {},
        { params: { size: 50 } },
      );
      setAllRegions(response.data?.content || []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to fetch regions")
    } finally {
      setLoadingRegions(false);
    }
  }, []);

  useEffect(() => {
    if (error){
      toast.error(error);
    }
  }, [error]);

  const fetchDistricts = useCallback(
    async (regionId: string, type: "contact") => {
      if (!regionId) return;
      const setLoading = setLoadingContactDistricts;
      const setOptions = setContactDistrictOptions;
      setLoading(true);
      setOptions([]);
      try {
        const payload = {
          where: [{ leftHand: {value: "regionId"}, matchMode: "EQUAL", rightHand: {value: Number(regionId)}, operator: "AND" }],
        };
        const response = await axiosInstance.post(
          "/api/v1.0/districts/search",
          payload,
          { params: { size: 261 } },
        );
        setOptions(response.data?.content || []);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error(`Failed to fetch ${type} districts`);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRegions().then(()=>{});
  }, [fetchRegions]);

  useEffect(() => {
    if (formState.contactRegionId)
      fetchDistricts(formState.contactRegionId, "contact").then(()=>{});
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (fetchError) {
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
      const contactRegionIdStr = contact?.district?.regionId?.toString() ?? "";
      const contactDistrictIdStr = contact?.districtId?.toString() ?? "";

      const loadedState: PersonalDetailsState = {
        firstName: app.firstName || "",
        lastName: app.lastName || "",
        isForeigner: app.isGhanaian ?? "indeterminate",
        gender: app.gender || "",
        dob: app.dateOfBirth
          ? format(new Date(app.dateOfBirth), "yyyy-MM-dd")
          : "",
        birthPlace: app.placeOfBirth || "",
        country: app.country || "",
        nationality: app.nationality || "",
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
        ghanaCardNumber: app.ghanaCardNumber || "",
      };

      setFormState(loadedState);
      setInitialValues(JSON.parse(JSON.stringify(loadedState)));

      setProfilePhoto(null);
      if (app.profilePhotoId) {
        fetchPhotoPreviewUrl(app.profilePhotoId).then(()=>{});
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
    const inputElement = event.target;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          const aspectRatio = width / height;
          const lowerBound = TARGET_ASPECT_RATIO - ASPECT_RATIO_TOLERANCE;
          const upperBound = TARGET_ASPECT_RATIO + ASPECT_RATIO_TOLERANCE;

          if (width === 175 && height === 225) {
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
          } else if (aspectRatio >= lowerBound && aspectRatio <= upperBound) {
            // toast.warn(`Photo aspect ratio is acceptable but not exactly 35mm x 45mm (${width}x${height}). Resizing might occur.`);
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
          } else {
            // toast.warn(`Incorrect dimensions/ratio. Please upload a 35mm x 45mm passport photo. Your image is ${width}x${height}.`);
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            // setProfilePhoto(null);
            // if (application?.applicant?.profilePhotoId) { fetchPhotoPreviewUrl(application.applicant.profilePhotoId).then(() => {}); }
            // else { setPhotoPreview(null); }
            // inputElement.value = '';
          }
        };
        img.onerror = () => {
          toast.error("Could not read image dimensions.");
          setProfilePhoto(null);
          if (application?.applicant?.profilePhotoId) { fetchPhotoPreviewUrl(application.applicant.profilePhotoId).then(() => {}); } else { setPhotoPreview(null); }
          inputElement.value = '';
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => { toast.error("Failed to read file."); inputElement.value = ''; };
      reader.readAsDataURL(file);

    } else {
      setProfilePhoto(null);
      if (application?.applicant?.profilePhotoId) { fetchPhotoPreviewUrl(application.applicant.profilePhotoId); }
      else { setPhotoPreview(null); }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setProfilePhoto(null);
    if (application?.applicant?.profilePhotoId) {
      fetchPhotoPreviewUrl(application.applicant.profilePhotoId).then(()=>{});
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formState.firstName) newErrors.fullName = 'First name is required';
    if (!formState.lastName) newErrors.lastName = 'Last name is required';
    if (!formState.email) newErrors.email = 'Email is required';
    if (!formState.phone || !PHONE_REGEX.test(formState.phone)) newErrors.phone = 'Please enter a valid mobile money number';
    if (formState.ghanaCardNumber && !GHANA_CARD_REGEX.test(formState.ghanaCardNumber)) newErrors.ghanaCardNumber = 'Please enter a valid Ghana card number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form.");
      return;
    };

    if (disable){
      onNext();
      return;
    }

    if (!applicationId || !application?.applicant?.id) {
      toast.error("Application/Applicant ID not found.");
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
        setLoading(true);
        const presignResponse = await axiosInstance.post(
          "/api/v1.0/files/upload",
          { name: profilePhoto.name },
        );
        const { id: newPhotoId, signedUrl } = presignResponse.data;
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
        setLoading(false);
      } catch (uploadError) {
        setLoading(false);
        setError(
          `Photo upload failed: ${uploadError || "Please try again."}`,
        );
        return;
      }
    }

    const applicantPayload: ApplicantInput = {
      firstName: formState.firstName || "",
      lastName: formState.lastName || "",
      phoneNumber: formState.phone || "",
      email: formState.email || "",
      gender: formState.gender || "",
      dateOfBirth: formState.dob ? new Date(formState.dob).getTime() : 0,
      placeOfBirth: formState.birthPlace || "",
      country: formState.country || "",
      nationality: formState.nationality || "",
      languagesSpoken: formState.languagesSpoken || "",
      medicalConditions: formState.selectedConditions.includes("none")
        ? ""
        : formState.selectedConditions.join(", "),
      profilePhotoId: profilePhotoIdToSubmit,
      ghanaCardNumber: formState.ghanaCardNumber,
      contactInformation: {
        address: formState.address || "",
        city: formState.city || "",
        districtId: formState.contactDistrictId
          ? Number(formState.contactDistrictId)
          : null,
        digitalAddress: formState.digitalAddress || "",
        contactPersonName: formState.parentName || "",
        contactPersonPhoneNUmber: formState.parentContact || "",
        phoneNumber: formState.phone,
        email: formState.email,
      },
    };

    const succ = await updateApplicantDetails(applicantPayload);
    if (!succ){
      toast.error("Could not update applicant details")
      return;
    }
    const success = await updateApplication({registrationStage: mapStageToStepId(application?.registrationStage ?? "PERSONAL_DETAILS") <= mapStageToStepId("PERSONAL_DETAILS")
          ? "DRAFT"
          :  application?.registrationStage});
    if (success) {
      setProfilePhoto(null);
      onNext();
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">
                Given Names <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                className="focus:ring-green-500"
                value={formState.firstName}
                onChange={handleInputChange}
                required
                disabled={true}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">
                Surame <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                className="focus:ring-green-500"
                value={formState.lastName}
                onChange={handleInputChange}
                required
                disabled={true}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ghanaCardNumber">Ghana Card Number</Label>
              <Input
                id="ghanaCardNumber"
                name="ghanaCardNumber"
                className="focus:ring-green-500"
                value={formState.ghanaCardNumber}
                onChange={handleInputChange}
                disabled={isLoading || disable}
              />
              {errors.ghanaCardNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.ghanaCardNumber}</p>
                )}
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
                disabled={isLoading || disable}
              >
                <SelectTrigger id="gender" className="w-full focus:ring-green-500">
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
                className="block w-full focus:ring-green-500"
                disabled={isLoading || disable}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthPlace">
                Birth Place (Town/City) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="birthPlace"
                name="birthPlace"
                className="focus:ring-green-500"
                value={formState.birthPlace}
                onChange={handleInputChange}
                required
                disabled={isLoading || disable}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select
                  name="country"
                  value={formState.country}
                  onValueChange={(value) =>
                      handleSelectChange("country", value)
                  }
                  required
                  disabled={isLoading || disable}
              >
                <SelectTrigger id="country" className="w-full focus:ring-green-500">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled={isLoading || disable}
              >
                <SelectTrigger id="nationality" className="w-full focus:ring-green-500">
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
              <Label htmlFor="languages">
                Languages Spoken <span className="text-red-500">*</span>
              </Label>
              <Input
                id="languages"
                name="languagesSpoken"
                className="focus:ring-green-500"
                value={formState.languagesSpoken}
                onChange={handleInputChange}
                required
                placeholder="e.g. English, Twi"
                disabled={isLoading || disable}
              />
            </div>
            {/* <div className="space-y-1.5">
              <Label htmlFor="foreigner">
                Are you a Ghanaian? <span className="text-red-500">*</span>
              </Label>
              <Checkbox id="foreigner" checked={formState.isForeigner} />
            </div> */}
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
                      disable ||
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
              <span className="text-sm text-gray-500"><strong>Please make sure to upload a clear passport photo</strong></span>
              <Label className="font-medium pt-4 text-gray-700">
                Profile Photo <span className="text-red-500">*</span>{" "}
              </Label>
              <Input
                id="profilePhotoInput"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handlePhotoChange}
                ref={fileInputRef}
                className="hidden"
                required={!profilePhoto && !photoPreview}
                disabled={isLoading || disable}
              />
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFileButtonClick}
                  disabled={isLoading || disable}
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
                      disabled={isLoading || disable}
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
              <Avatar className="h-45 w-35 border rounded-none">
                <AvatarImage
                    src={photoPreview ?? undefined}
                    alt="Photo preview"
                    className="object-cover"
                />
                <AvatarFallback className={cn("rounded-none", isFetchingPreview && "animate-pulse")}>
                  <UserIcon className="h-12 w-12 text-gray-400"/>
                </AvatarFallback>
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
                  className="focus:ring-green-500"
                  value={formState.address}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || disable}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">
                  City / Town <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  className="focus:ring-green-500"
                  value={formState.city}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || disable}
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
                  disabled={isLoading || loadingRegions || disable}
                >
                  <SelectTrigger id="contactRegionId" className="w-full focus:ring-green-500">
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
                    disable ||
                    isLoading ||
                    loadingContactDistricts ||
                    !formState.contactRegionId
                  }
                >
                  <SelectTrigger id="contactDistrictId" className="w-full focus:ring-green-500">
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
                  className="focus:ring-green-500"
                  value={formState.digitalAddress}
                  onChange={handleInputChange}
                  placeholder="e.g. GA-123-4567"
                  disabled={isLoading || disable}
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
                  className="focus:ring-green-500"
                  value={formState.phone}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || disable}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  className="focus:ring-green-500"
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  required
                  disabled={true}
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
                  className="focus:ring-green-500"
                  value={formState.parentName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || disable}
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
                  className="focus:ring-green-500"
                  value={formState.parentContact}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading || disable}
                />
                {errors.parentContact && (
                  <p className="text-xs text-red-600 mt-1">{errors.parentContact}</p>
                )}
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
