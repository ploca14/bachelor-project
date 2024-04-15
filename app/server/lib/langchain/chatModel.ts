import { ChatOpenAI } from "@langchain/openai";

const openAIChatModel = () => {
  const config = useRuntimeConfig();

  const model = new ChatOpenAI({
    modelName: config.openAIModel,
    streaming: true,
    maxConcurrency: 50,
    maxRetries: 10,
  });

  return model;
};

export const useChatModel = () => {
  return openAIChatModel();
};
