import type { FileDTO } from "./fileDto";
import type { MessageDto } from "./messageDto";

export interface ConversationDTO {
  id: string;
  name: string;
  files: Array<FileDTO>;
  messages: Array<MessageDto>;
}
