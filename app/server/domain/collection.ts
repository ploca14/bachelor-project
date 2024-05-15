import { v4 as uuidv4 } from "uuid";

export class Collection {
  constructor(
    public name: string,
    private readonly _fileIds: string[],
    public readonly userId: string,
    private readonly _createdAt: Date = new Date(),
    public readonly id: string = uuidv4(),
  ) {}

  get fileIds() {
    return Array.from(this._fileIds);
  }

  get createdAt() {
    return new Date(this._createdAt);
  }

  addFile(fileId: string) {
    if (!this._fileIds.includes(fileId)) {
      this._fileIds.push(fileId);
    }
  }

  removeFile(fileId: string) {
    const index = this._fileIds.indexOf(fileId);
    if (index === -1) {
      return;
    }

    this._fileIds.splice(index, 1);
  }
}
