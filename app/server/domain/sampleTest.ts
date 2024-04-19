import { v4 as uuidv4 } from "uuid";
import { Question } from "~/server/domain/question";

export class SampleTest {
  constructor(
    public name: string,
    private _status: "complete" | "error" | "pending",
    private readonly _fileIds: string[],
    public readonly userId: string,
    private readonly _questions: Question[] = [],
    private readonly _createdAt: Date = new Date(),
    public readonly id: string = uuidv4(),
  ) {}

  public addQuestions(questions: string[]) {
    const newQuestions = questions.map(
      (content) => new Question(content, this.id),
    );
    this._questions.push(...newQuestions);
    return this.questions;
  }

  get fileIds() {
    return Array.from(this._fileIds);
  }

  get questions() {
    return Array.from(this._questions);
  }

  get createdAt() {
    return new Date(this._createdAt);
  }

  get status() {
    return this._status;
  }

  set status(status: "complete" | "error" | "pending") {
    if (!["complete", "error", "pending"].includes(status)) {
      throw new Error("Invalid status");
    }

    this._status = status;
  }
}
