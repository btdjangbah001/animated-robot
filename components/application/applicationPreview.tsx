"use client";

import * as React from "react";
import { ArrowLeft, Send, Edit, User as UserIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useApplicationStore from "@/store/applicationStore";
import axiosInstance from "@/lib/axios";
import { CoreResultOutput, ElectiveResultOutput } from "@/types/applicant";

interface ApplicationPreviewProps {
  onBack: () => void;
  onSubmit: () => void;
  onEdit: (stepId: number) => void;
}

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null;
}> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-b-0">
    <dt className="text-sm font-medium text-gray-600">{label}</dt>
    <dd className="text-sm text-gray-900 col-span-2 break-words">
      {value || "-"}
    </dd>
  </div>
);

type DisplaySubjectResult = (CoreResultOutput | ElectiveResultOutput) & {
  type: "Core" | "Elective";
};

export function ApplicationPreview({
  onBack,
  onSubmit,
  onEdit,
}: ApplicationPreviewProps) {
  const application = useApplicationStore((state) => state.application);
  const isLoading = useApplicationStore((state) => state.isLoading);
  const error = useApplicationStore((state) => state.error);
  const fetchApplication = useApplicationStore(
    (state) => state.fetchApplication,
  );

  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [isLoadingPhotoUrl, setIsLoadingPhotoUrl] = React.useState(false);

  React.useEffect(() => {
    if (!application && !isLoading && !error) {
      fetchApplication();
    }
  }, [application, isLoading, error, fetchApplication]);

  React.useEffect(() => {
    const currentPhotoId = application?.applicant?.profilePhotoId;
    if (currentPhotoId && !photoUrl && !isLoadingPhotoUrl) {
      const fetchUrl = async () => {
        setIsLoadingPhotoUrl(true);
        setPhotoUrl(null);
        try {
          const response = await axiosInstance.post(
            `/api/v1.0/files/download/${currentPhotoId}`,
          );
          setPhotoUrl(response.data?.signedUrl || null);
        } catch (err) {
          console.error("Failed to fetch photo preview URL:", err);
          setPhotoUrl(null);
        } finally {
          setIsLoadingPhotoUrl(false);
        }
      };
      fetchUrl();
    } else if (!currentPhotoId) {
      setPhotoUrl(null);
    }
  }, [application?.applicant?.profilePhotoId, photoUrl, isLoadingPhotoUrl]);

  const allSubjects = React.useMemo(
    (): DisplaySubjectResult[] => [
      ...(application?.coreResults?.map((s) => ({
        ...s,
        type: "Core" as const,
      })) || []),
      ...(application?.electiveResults?.map((s) => ({
        ...s,
        type: "Elective" as const,
      })) || []),
    ],
    [application?.coreResults, application?.electiveResults],
  );

  const formattedDob = application?.applicant?.dateOfBirth
    ? format(new Date(application.applicant.dateOfBirth), "do MMMM, yyyy")
    : "-";

  const displayConditions = application?.applicant?.medicalConditions
    ? application.applicant.medicalConditions
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s).length > 0
      ? application.applicant.medicalConditions
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
          .map((id) =>
            id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          )
          .join(", ")
      : "None"
    : "None";

  if (isLoading && !application) {
    return (
      <div className="flex justify-center items-center py-10">
        {" "}
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />{" "}
        <span className="ml-2 text-gray-600">
          Loading application summary...
        </span>{" "}
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-md">
        {" "}
        Error loading application data: {error}{" "}
      </div>
    );
  }
  if (!application) {
    return (
      <div className="text-center text-gray-500 py-10">
        Application data not available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Summary of your application
      </h2>

      <Accordion
        type="multiple"
        defaultValue={["item-1", "item-2", "item-3", "item-4", "item-5"]}
        className="w-full space-y-4"
      >
        <AccordionItem value="item-1" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:no-underline">
            {" "}
            Application Details{" "}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 pt-0">
            {" "}
            <dl>
              {" "}
              <DetailItem
                label="Application Status"
                value={application.registrationStage || "Draft"}
              />{" "}
              <DetailItem
                label="Application PIN"
                value={application.applicationPin}
              />{" "}
            </dl>{" "}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:no-underline">
            {" "}
            Program Details{" "}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 gap-1 text-xs text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(1);
              }}
            >
              {" "}
              <Edit className="h-3 w-3" /> Edit{" "}
            </Button>{" "}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 pt-0">
            {" "}
            <dl>
              <DetailItem
                label="Program Type"
                value={application.program?.programType?.title}
              />
              <DetailItem
                label="Institution Name"
                value={application.institution?.name}
              />
              <DetailItem
                label="Program Name"
                value={application.program?.title}
              />
            </dl>{" "}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:no-underline">
            {" "}
            Academic Details{" "}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 gap-1 text-xs text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(2);
              }}
            >
              {" "}
              <Edit className="h-3 w-3" /> Edit{" "}
            </Button>{" "}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              <div className="col-span-1">
                <dt className="text-sm font-medium text-gray-600">
                  Application Type
                </dt>
                <dd className="text-sm text-gray-900">
                  {application.examinationType || "-"}
                </dd>
              </div>
              <div className="col-span-1">
                <dt className="text-sm font-medium text-gray-600">
                  Aggregate Grade
                </dt>
                <dd className="text-sm text-gray-900">
                  {application.aggregateGrade || "-"}
                </dd>
              </div>
            </div>
            {allSubjects.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%] sm:w-[20%]">
                      WAEC Course / Type
                    </TableHead>
                    <TableHead className="w-[30%] sm:w-[30%]">
                      Subject
                    </TableHead>
                    <TableHead className="w-[10%] sm:w-[10%] text-center">
                      Grade
                    </TableHead>
                    <TableHead className="w-[20%] sm:w-[20%]">
                      Index Number
                    </TableHead>
                    <TableHead className="w-[15%] sm:w-[20%]">
                      Exam Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allSubjects.map((s, index) => (
                    <TableRow key={s.id || index}>
                      <TableCell>
                        {s.type === "Elective"
                          ? (s as ElectiveResultOutput).course?.name
                          : s.type}
                      </TableCell>
                      <TableCell>{s.subject?.name}</TableCell>
                      <TableCell className="text-center">{s.grade}</TableCell>
                      <TableCell>{s.indexNumber}</TableCell>
                      <TableCell>{`${s.month || ""}, ${s.year || ""}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:no-underline">
            {" "}
            Personal Details{" "}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 gap-1 text-xs text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(3);
              }}
            >
              {" "}
              <Edit className="h-3 w-3" /> Edit{" "}
            </Button>{" "}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 pt-0 space-y-4">
            <div className="flex justify-end py-2">
              <Avatar className="h-24 w-24 border">
                <AvatarImage src={photoUrl ?? undefined} alt="Profile photo" />
                <AvatarFallback
                  className={cn(isLoadingPhotoUrl && "animate-pulse")}
                >
                  <UserIcon className="h-10 w-10 text-gray-400" />
                </AvatarFallback>
              </Avatar>
            </div>
            <dl>
              <DetailItem
                label="First Name"
                value={application.applicant?.firstName}
              />
              <DetailItem
                label="Middle Name"
                value={application.applicant?.middleName}
              />
              <DetailItem
                label="Last Name"
                value={application.applicant?.lastName}
              />
              <DetailItem
                label="Gender"
                value={application.applicant?.gender}
              />
              <DetailItem label="Date of Birth" value={formattedDob} />
              <DetailItem
                label="Birth Place (Town/City)"
                value={application.applicant?.placeOfBirth}
              />
              <DetailItem
                label="Country of Birth"
                value={application.applicant?.country}
              />
              <DetailItem
                label="Nationality"
                value={application.applicant?.nationality}
              />
              <DetailItem
                label="Region of Birth"
                value={application.applicant?.district?.region?.name}
              />
              <DetailItem
                label="District of Birth"
                value={application.applicant?.district?.name}
              />
              <DetailItem
                label="Languages Spoken"
                value={application.applicant?.languagesSpoken}
              />
              <DetailItem
                label="Medical Condition/Disability"
                value={displayConditions}
              />
            </dl>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:no-underline">
            {" "}
            Contact & Parent/Guardian Details{" "}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 gap-1 text-xs text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(3);
              }}
            >
              {" "}
              <Edit className="h-3 w-3" /> Edit{" "}
            </Button>{" "}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4 pt-0">
            <dl>
              <h4 className="text-base font-semibold text-gray-700 mt-2 mb-2 pt-2 border-t">
                Contact Information
              </h4>
              <DetailItem
                label="Residential Address"
                value={application.applicant?.contactInformation?.address}
              />
              <DetailItem
                label="City / Town"
                value={application.applicant?.contactInformation?.city}
              />
              <DetailItem
                label="Region"
                value={
                  application.applicant?.contactInformation?.district?.region
                    ?.name
                }
              />
              <DetailItem
                label="District"
                value={
                  application.applicant?.contactInformation?.district?.name
                }
              />
              <DetailItem
                label="Digital Address"
                value={
                  application.applicant?.contactInformation?.digitalAddress
                }
              />
              <DetailItem
                label="Primary Phone"
                value={application.applicant?.phoneNumber}
              />
              <DetailItem
                label="Email Address"
                value={application.applicant?.email}
              />
              <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2 pt-4 border-t">
                Parent/Guardian/Next of Kin
              </h4>
              <DetailItem
                label="Full Name"
                value={
                  application.applicant?.contactInformation?.contactPersonName
                }
              />
              <DetailItem
                label="Contact Number"
                value={
                  application.applicant?.contactInformation
                    ?.contactPersonPhoneNUmber
                }
              />
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-between pt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          {" "}
          <ArrowLeft className="mr-2 h-4 w-4" /> Back{" "}
        </Button>
        <Button
          type="button"
          className="bg-green-500 hover:bg-green-600"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {" "}
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Submit Application <Send className="ml-2 h-4 w-4" />{" "}
        </Button>
      </div>
    </div>
  );
}
