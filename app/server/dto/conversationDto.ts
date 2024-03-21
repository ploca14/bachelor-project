import type { FileDTO } from "./fileDto";
import type { MessageDto } from "./messageDto";

export interface ConversationDTO {
  id: string;
  files: Array<FileDTO>;
  messages: Array<MessageDto>;
}
