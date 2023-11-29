export const useUser = () => {
  const { user } = useAuthService();

  if (!isDefined(user)) {
    throw new Error("User is not logged in");
  }

  return user;
};
