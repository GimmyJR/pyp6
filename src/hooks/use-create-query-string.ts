import { usePathname, useSearchParams } from 'next/navigation';
import qs from 'query-string';

export default function useCreateQueryString() {
  const params = useSearchParams();

  // Convert URLSearchParams to a plain object
  const allParams = Object.fromEntries(params.entries());
  const pathname = usePathname();

  // Merge the current search params with the provided query object

  const createQueryString = (query: {
    [key: string]: string | number | boolean | undefined;
  }) => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          ...allParams,
          ...query,
        },
      },
      { skipNull: true, skipEmptyString: true }
    );

    return url;
  };

  return createQueryString;
}
