import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

export class PendingFile {
  public readonly name: string;

  constructor(
    public readonly originalName: string,
    private _status: "uploading" | "processing" | "failed",
    private _uploadProgress: number = 0,
    private _failReason?: string,
    private _id: string = uuidv4(),
  ) {
    this.name = `${slugify(originalName)}-${Date.now()}`;
  }

  get status() {
    return this._status;
  }

  get uploadProgress() {
    return this._uploadProgress;
  }

  get failReason() {
    return this._failReason;
  }

  get id() {
    return this._id;
  }

  set uploadProgress(progress: number) {
    if (this._status === "uploading" && progress > 100) {
      throw new Error("Progress cannot be greater than 100");
    }

    this._uploadProgress = progress;
  }

  startProcessing() {
    if (this._status === "uploading" && this._uploadProgress === 100) {
      this._status = "processing";
    }
  }

  markAsFailed(reason: string) {
    this._status = "failed";
    this._failReason = reason;
  }
}
