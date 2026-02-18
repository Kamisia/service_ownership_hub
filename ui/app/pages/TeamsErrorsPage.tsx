import React, { useMemo, useState } from "react";
import { useDql, useSettingsObjectsV2 } from "@dynatrace-sdk/react-hooks";
import { Button } from "@dynatrace/strato-components/buttons";
import { Skeleton } from "@dynatrace/strato-components/content";
import { TextInput } from "@dynatrace/strato-components-preview/forms";
import { useIntl } from "react-intl";
import { buildQuery } from "../dql/teamsErrorsQuery";
import { formatTs, parseTeamsMap } from "../dql/teamsErrorsUtils";
import {
  TeamsErrorsTable,
  type TeamsErrorRow,
} from "../components/teamsErrors/TeamsErrorsTable";
import { PageSection } from "app/components/layout/PageSection";
import { mapAppSettingsObjectToTeam } from "app/utils/teams/helpers";
import { TEAMS_SCHEMA_ID } from "app/utils/teams/constants";
import { pagesMessages } from "./messages";

type RawDqlRecord = {
  timestamp: string | number;
  content?: string;
  team?: string;
  "service.name"?: string;
};

export default function TeamsErrorPage() {
  const intl = useIntl();
  const [q, setQ] = useState("");
  const { data } = useSettingsObjectsV2({
    schemaId: TEAMS_SCHEMA_ID,
    addFields: "value",
  });

  const query = useMemo(() => {
    const teams = data?.items.map(mapAppSettingsObjectToTeam);
    const recordsString = parseTeamsMap(teams);
    return buildQuery(recordsString);
  }, [data]);

  const result = useDql({ query });

  const rowsAll = useMemo((): TeamsErrorRow[] => {
    const records = (result.data?.records ?? []) as RawDqlRecord[];

    return records.map((r) => ({
      timestampText: formatTs(r.timestamp),
      content: r.content ?? "",
      team: r.team ?? "",
      serviceName: r["service.name"] ?? "",
    }));
  }, [result.data]);

  const rows = useMemo(() => {
    const queryText = q.trim().toLowerCase();
    if (!queryText) return rowsAll;

    return rowsAll.filter((r) => {
      return (
        r.serviceName.toLowerCase().includes(queryText) ||
        r.team.toLowerCase().includes(queryText) ||
        r.content.toLowerCase().includes(queryText)
      );
    });
  }, [rowsAll, q]);

  return (
    <PageSection
      title={intl.formatMessage(pagesMessages.teamsErrorsTitle)}
      description={intl.formatMessage(pagesMessages.teamsErrorsDescription)}
      right={
        <>
          <TextInput
            value={q}
            onChange={setQ}
            placeholder={intl.formatMessage(pagesMessages.teamsErrorsFilterPlaceholder)}
          />
          <Button
            onClick={() => {
              void result
                .refetch?.()
                .catch((e) => console.error("Refetch failed:", e));
            }}
            disabled={result.isLoading}
          >
            {intl.formatMessage(pagesMessages.refreshButton)}
          </Button>
        </>
      }
    >
      {result.isLoading && (
        <>
          <Skeleton />
          <div>{intl.formatMessage(pagesMessages.loadingText)}</div>
        </>
      )}

      {result.error && (
        <div role="alert">
          {intl.formatMessage(pagesMessages.loadFailedText, {
            error: String(result.error),
          })}
        </div>
      )}

      {!result.isLoading && !result.error && <TeamsErrorsTable rows={rows} />}
    </PageSection>
  );
}
