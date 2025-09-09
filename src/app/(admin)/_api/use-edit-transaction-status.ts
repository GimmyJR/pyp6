/* eslint-disable @typescript-eslint/no-explicit-any */
export const useEditTransactionStatus = () => {
  const editStatus = async (id?: string, data?: any) => {
    console.log('Stub: edit transaction status', id, data);
  };
  return { editStatus };
};
