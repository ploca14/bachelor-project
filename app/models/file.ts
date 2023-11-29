import type { Database } from "#imports";
import slugify from "slugify";
type SupabaseFile = Database["public"]["Tables"]["files"]["Row"];

export class UploadedFile {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly original_name: string,
    readonly created_at: Date,
    readonly status = "uploaded" as const,
  ) {}

  static fromSupabaseFile(file: SupabaseFile): UploadedFile {
    return new UploadedFile(
      file.id.toString(),
      file.name,
      file.original_name,
      new Date(file.created_at),
    );
  }
}

export class PendingFile {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly original_name: string,
    readonly file: File,
    public status: "uploading" | "processing" | "failed" = "uploading",
    public progress: number = 0,
  ) {}

  static fromFile(file: File): PendingFile {
    const id = `${slugify(file.name)}-${Date.now()}`;
    return new PendingFile(id, id, file.name, file);
  }
}
