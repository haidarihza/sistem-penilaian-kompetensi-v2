export class ApiError extends Error {
  public msg: string;

  constructor(message?: string) {
    super(message || "");
    this.msg = message || "";
  }
}