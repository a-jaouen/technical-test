export class HttpError extends Error {
  readonly status: number;

  /**
   * Create an error the client may see, answered as is by the error middleware
   * @param status - HTTP status of the answer
   * @param message - Message shown to the client
   */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
