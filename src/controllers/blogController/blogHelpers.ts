import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";

export function parseAuth(auth: string | undefined): string {
  if (!auth) {
    throw new ErrorWithCustomStatus(500, "No auth provided");
  }
  const authHasRightFormat: Boolean =
    /Bearer\s{1}[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]/.test(auth);
  if (!authHasRightFormat) {
    throw new ErrorWithCustomStatus(
      500,
      "Format of Bearer token is incorrect.",
    );
  }
  const token = auth.split(" ")[1];
  if (!token || typeof token !== "string") {
    throw new ErrorWithCustomStatus(
      500,
      "Something went wrong while trying to process this auth header.",
    );
  }
  return token;
}
