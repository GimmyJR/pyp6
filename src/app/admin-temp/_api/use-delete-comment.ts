import { client } from "@/lib/hono";
import { useMutation } from "@tanstack/react-query";

type ResponseType = void;

export const useDeleteComment = (id: string) => {
  return useMutation({
    mutationFn: () => {
      return client.api.post[":id"]["$delete"]({ param: { id } });
    },
  });
};
