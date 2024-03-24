export const useHistoryState = () => {
  const historyState = ref(window.history.state);

  useEventListener(window, "popstate", () => {
    historyState.value = window.history.state;
  });

  return historyState;
};
