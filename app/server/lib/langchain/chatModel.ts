import { ChatOpenAI } from "@langchain/openai";

const openAIChatModel = () => {
  const config = useRuntimeConfig();

  const model = new ChatOpenAI({
    modelName: config.openAIModel,
    streaming: true,
    maxRetries: 1,
  });

  return model;
};

export const useChatModel = () => {
  return openAIChatModel();
};
