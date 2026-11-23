/** An error the client may see: the error middleware answers with this status and message */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
