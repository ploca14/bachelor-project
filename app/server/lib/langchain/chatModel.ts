import { ChatOpenAI } from "@langchain/openai";

const openAIChatModel = () => {
  const config = useRuntimeConfig();

  const model = new ChatOpenAI({
    modelName: config.openAIModel,
    streaming: true,
    maxConcurrency: 50,
    timeout: 10_000, // 10 seconds
  });

  return model;
};

export const useChatModel = () => {
  return openAIChatModel();
};
