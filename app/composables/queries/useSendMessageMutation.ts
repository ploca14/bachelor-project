interface SendMessageVariables {
  content: string;
  onToken: (token: string) => void;
}

const decoder = new TextDecoder("utf-8");

export const useSendMessageMutation = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, onToken }: SendMessageVariables) => {
      const response = await $fetch.raw(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: { content },
          responseType: "stream",
        },
      );

      if (!response.body) {
        throw new Error("The response body is empty.");
      }

      const reader = response.body.getReader();

      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const decoded = decoder.decode(value);

        answer += decoded;
        onToken(decoded);
      }

      return answer;
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
};
