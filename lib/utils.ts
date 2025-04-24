import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {CoreResultInput, ElectiveResultInput} from "@/types/application";
import {CoreResultOutput, ElectiveResultOutput} from "@/types/applicant";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ComparableKeys = "subjectId" | "grade" | "indexNumber" | "year" | "month";
type ElectiveKeys = ComparableKeys | "courseId";

function createCoreComparableHash(obj: Partial<Record<ComparableKeys, string | number | null>>): string {
  return [
    obj.subjectId,
    obj.grade ?? "",
    obj.indexNumber ?? "",
    obj.year ?? "",
    obj.month ?? "",
  ].join("|");
}

function createElectiveComparableHash(obj: Partial<Record<ElectiveKeys, string | number | null>>): string {
  return [
    obj.subjectId,
    obj.grade ?? "",
    obj.indexNumber ?? "",
    obj.year ?? "",
    obj.month ?? "",
    obj.courseId ?? "",
  ].join("|");
}



export function areCoreResultsEqual(
    inputs: CoreResultInput[],
    outputs: CoreResultOutput[]
): boolean {
  if (inputs.length !== outputs.length) return false;

  const inputHashes = new Set(inputs.map(createCoreComparableHash));

  for (const output of outputs) {
    const hash = createCoreComparableHash(output);
    if (!inputHashes.has(hash)) return false;
  }
  return true;
}


export function areElectivesResultsEqual(
    inputs: ElectiveResultInput[],
    outputs: ElectiveResultOutput[]
): boolean {
  if (inputs.length !== outputs.length) return false;

  const inputHashes = new Set(inputs.map(createElectiveComparableHash));

  for (const output of outputs) {
    const hash = createElectiveComparableHash(output);
    if (!inputHashes.has(hash)) return false;
  }

  return true;
}
