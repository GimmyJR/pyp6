/* eslint-disable @typescript-eslint/no-explicit-any */
export const useEditUser = () => {
  const editUser = async (id?: string, data?: any) => {
    console.log('Stub: edit user', id, data);
  };
  return { editUser };
};
