import { MIN_YEAR } from "../../util/constants.ts";
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";

export function validateYear(bodyYear: number | undefined): number | null {

  if (!bodyYear) {
    return null;
  }
  if (bodyYear < MIN_YEAR) {
    throw new ErrorWithCustomStatus(
      400,
      `Year must be greater than or equal to ${MIN_YEAR}.`,
    );
  }
  const date: Date = new Date();
  if (bodyYear > date.getFullYear()) {
    throw new ErrorWithCustomStatus(
      400,
      `Year must not be greater than the current year.`,
    );
  }
  return bodyYear;
}
