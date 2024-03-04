import { v4 as uuidv4 } from "uuid";

export class File {
  constructor(
    public readonly name: string,
    public readonly originalName: string,
    public readonly ownerId: string,
    public readonly createdAt: Date = new Date(),
    public readonly id: string = uuidv4(),
  ) {}
}
