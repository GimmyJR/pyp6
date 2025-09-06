'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';

/**
 * Custom hook for managing URL query parameters
 * Provides functions to add, update, and remove query parameters
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Sets or updates a query parameter in the URL
   * @param key - The name of the query parameter
   * @param value - The value to set for the query parameter
   */
  const setQueryParam = (key: string, value: string | number | boolean) => {
    // Parse the current query parameters
    const currentQuery = queryString.parse(searchParams.toString());

    // Update or add the new parameter
    const updatedQuery = {
      ...currentQuery,
      [key]: value,
    };

    // Stringify the updated query parameters
    const newQueryString = queryString.stringify(updatedQuery);

    // Create the new URL path
    const newPathname = newQueryString ? `?${newQueryString}` : '';

    // Push the new URL to the history
    router.push(`${pathname}${newPathname}`, {
      scroll: false, // Keep the scroll position
    });
  };

  /**
   * Removes a query parameter from the URL
   * @param key - The name of the query parameter to remove
   */
  const removeQueryParam = (key: string) => {
    // Parse the current query parameters
    const currentQuery = queryString.parse(searchParams.toString());

    // Remove the specified parameter
    delete currentQuery[key];

    // Stringify the updated query parameters
    const newQueryString = queryString.stringify(currentQuery);

    // Create the new URL path
    const newPathname = newQueryString ? `?${newQueryString}` : '';

    // Push the new URL to the history
    router.push(`${pathname}${newPathname}`, {
      scroll: false, // Keep the scroll position
    });
  };

  /**
   * Sets multiple query parameters at once
   * @param params - Object containing key-value pairs to set as query parameters
   */
  const setQueryParams = (
    params: Record<string, string | number | boolean>
  ) => {
    // Parse the current query parameters
    const currentQuery = queryString.parse(searchParams.toString());

    // Update with new parameters
    const updatedQuery = {
      ...currentQuery,
      ...params,
    };

    // Stringify the updated query parameters
    const newQueryString = queryString.stringify(updatedQuery);

    // Create the new URL path
    const newPathname = newQueryString ? `?${newQueryString}` : '';

    // Push the new URL to the history
    router.push(`${pathname}${newPathname}`, {
      scroll: false, // Keep the scroll position
    });
  };

  /**
   * Clears all query parameters from the URL
   */
  const clearQueryParams = () => {
    router.push(pathname, {
      scroll: false, // Keep the scroll position
    });
  };

  /**
   * Gets the current value of a query parameter
   * @param key - The name of the query parameter
   * @returns The value of the query parameter or null if it doesn't exist
   */
  const getQueryParam = (key: string) => {
    return searchParams.get(key);
  };

  return {
    setQueryParam,
    removeQueryParam,
    setQueryParams,
    clearQueryParams,
    getQueryParam,
  };
}
