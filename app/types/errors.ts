export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConversationDisabledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversationDisabledError";
  }
}

export class InvalidMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMessageError";
  }
}

export class NoFilesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoFilesError";
  }
}
