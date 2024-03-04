export interface ConversationListItemDTO {
  id: string;
  name: string;
  lastMessageSentAt: Date | null;
  lastMessage: string | null;
}
