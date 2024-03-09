import { ChatOpenAI } from "@langchain/openai";

const openAIChatModel = () => {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125", // #TODO: Put model name into config
    streaming: true,
    // verbose: true,
  });

  return model;
};

export const useChatModel = () => {
  return openAIChatModel();
};
