import { Collection } from "~/server/domain/collection";

export const collectionMapper = {
  toDomain: (raw: any) => {
    return new Collection(
      raw.name,
      raw.files.map(({ fileId }: any) => fileId),
      raw.userId,
      raw.createdAt,
      raw.id,
    );
  },
  toPersistence: (collection: Collection) => {
    return {
      id: collection.id,
      name: collection.name,
      userId: collection.userId,
      createdAt: collection.createdAt,
    };
  },
};
