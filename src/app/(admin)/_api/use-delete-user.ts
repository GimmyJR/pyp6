/* eslint-disable @typescript-eslint/no-explicit-any */
export const useDeleteUser = () => {
  const deleteUser = async (id?: string) => {
    console.log('Stub: delete user', id);
  };
  return { deleteUser };
};
