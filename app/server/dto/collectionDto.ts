import type { FileDTO } from "./fileDto";

export interface CollectionDTO {
  id: string;
  name: string;
  files: Array<FileDTO>;
}
