import { v4 as uuidv4 } from "uuid";
import { Message } from "~/server/domain/message";
import {
  ConversationDisabledError,
  InvalidMessageError,
  NoFilesError,
} from "~/types/errors";

export class Conversation {
  constructor(
    public name: string,
    private readonly _fileIds: string[],
    public readonly userId: string,
    private readonly _messages: Message[] = [],
    private readonly _createdAt: Date = new Date(),
    public readonly id: string = uuidv4(),
  ) {
    if (_fileIds.length === 0) {
      throw new NoFilesError("A conversation must have at least one file");
    }
  }

  get fileIds() {
    return Array.from(this._fileIds);
  }

  get messages() {
    return Array.from(this._messages);
  }

  get createdAt() {
    return new Date(this._createdAt);
  }

  addHumanMessage(content: string) {
    // Do not allow to send a message if the conversation is disabled
    if (this.isDisabled) {
      throw new ConversationDisabledError("The conversation is disabled");
    }

    // Do not allow to send two messages in a row
    if (this.lastMessage?.role === "human") {
      throw new InvalidMessageError("You can't send two messages in a row");
    }

    const message = new Message("human", content, this.id);
    this._messages.push(message);
    return message;
  }

  addAiMessage(content: string) {
    const message = new Message("ai", content, this.id);
    this._messages.push(message);
    return message;
  }

  get lastMessage() {
    return this._messages.at(-1);
  }

  get previousMessages() {
    return this._messages.slice(0, -1);
  }

  // Disable the conversation if all the conversation files are deleted
  get isDisabled() {
    return this.fileIds.length === 0;
  }
}
