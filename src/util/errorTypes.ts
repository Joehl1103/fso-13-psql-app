import type { BaseError, ValidationError } from "sequelize";

type DownstreamError = Error | BaseError | ValidationError;

class ErrorWithCustomStatus extends Error {
  status: number;

  constructor(status: number, message: string) {
    super();
    this.status = status;
    this.message = this.setMessage(message);
    this.name = "ErrorWithCustomStatus";
  }

  setMessage(message: string): string {
    return message;
  }
}

interface ErrorResponseType {
  status: number;
  text: string;
}

export type { DownstreamError };
export { ErrorWithCustomStatus };
