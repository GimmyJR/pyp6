/* eslint-disable @typescript-eslint/no-explicit-any */
export const useGetUser = () => {
  const getUser = async (id?: string) => {
    console.log('Stub: get user', id);
    return {};
  };
  return { getUser };
};
