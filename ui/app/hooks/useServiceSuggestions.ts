import { useMemo } from "react";
import { useDql } from "@dynatrace-sdk/react-hooks";
import { servicesQuery } from "app/dql/servicesQuery";

type ServiceRecord = {
  "service.name"?: string;
};

export function useServiceSuggestions() {
  const result = useDql({ query: servicesQuery() });

  const suggestions = useMemo(() => {
    const records = (result.data?.records ?? []) as ServiceRecord[];
    return Array.from(
      new Set(
        records
          .map((record) => record["service.name"]?.trim())
          .filter((serviceName): serviceName is string => Boolean(serviceName)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [result.data]);

  return {
    suggestions,
    isLoading: result.isLoading,
  };
}
