import { RunnableLambda } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";

const INTERACTION_WINDOW_SIZE = 5;

export type CondenseHistoryChain = RunnableLambda<BaseMessage[], BaseMessage[]>;

export const bufferedWindowCondenseHistoryChain = () => {
  const chain = RunnableLambda.from((chat_history: BaseMessage[]) => {
    return chat_history.slice(-INTERACTION_WINDOW_SIZE * 2);
  });

  return chain;
};

export const useCondenseHistoryChain = () => {
  return bufferedWindowCondenseHistoryChain();
};
