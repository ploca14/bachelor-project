// export interface UploadingStudyMaterialDTO {
//   name: string;
//   originalName: string;
//   status: "uploading";
//   progress: number;
// }

// export interface ProcessingStudyMaterialDTO {
//   name: string;
//   originalName: string;
//   status: "processing";
// }

export interface FileDTO {
  id: string;
  name: string;
  originalName: string;
  createdAt: Date;
}

// export interface FailedStudyMaterialDTO {
//   name: string;
//   originalName: string;
//   status: "failed";
//   reason: string;
// }

// export type StudyMaterialDTO =
//   | UploadingStudyMaterialDTO
//   | ProcessingStudyMaterialDTO
//   | UplodedStudyMaterialDTO
//   | FailedStudyMaterialDTO;
