import { File } from "~/server/domain/file";

export const fileMapper = {
  toDomain: (raw: any) => {
    return new File(
      raw.name,
      raw.originalName,
      raw.userId,
      raw.createdAt,
      raw.id,
    );
  },
  toPersistence: (file: File) => {
    return {
      id: file.id,
      name: file.name,
      originalName: file.originalName,
      createdAt: file.createdAt,
      userId: file.ownerId,
    };
  },
};
