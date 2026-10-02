import type { BaseError, ValidationError } from "sequelize";

type DownstreamError = Error | BaseError | ValidationError;

class ErrorWithCustomStatus extends Error {
  status: number;

  constructor(status: number, message: string) {
    super();
    this.status = status;
    this.message = message;
    this.name = "ErrorWithCustomStatus";
  }
}

export type { DownstreamError };
export { ErrorWithCustomStatus };
