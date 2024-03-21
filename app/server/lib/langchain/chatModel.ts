import { ChatOpenAI } from "@langchain/openai";

const openAIChatModel = () => {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125", // #TODO: Put model name into config
    streaming: true,
    timeout: 2 * 1000, // 2 seconds
  });

  return model;
};

export const useChatModel = () => {
  return openAIChatModel();
};
