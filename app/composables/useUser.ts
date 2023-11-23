export const useUser = () => {
  const user = useAuth().user;

  if (!isDefined(user)) {
    throw new Error("User is not logged in");
  }

  return user;
};
