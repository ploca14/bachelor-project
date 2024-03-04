export interface MessageDto {
  id: string;
  content: string;
  role: "human" | "ai";
  createdAt?: Date;
}
