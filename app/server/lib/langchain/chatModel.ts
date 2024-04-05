import { ChatOpenAI } from "@langchain/openai";

const openAIChatModel = () => {
  const config = useRuntimeConfig();

  const model = new ChatOpenAI({
    modelName: config.openAIModel,
    streaming: true,
    timeout: 2 * 1000, // 2 seconds
  });

  return model;
};

export const useChatModel = () => {
  return openAIChatModel();
};
