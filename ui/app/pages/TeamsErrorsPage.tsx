import React, { useMemo, useState } from "react";
import { useDql, useSettingsObjectsV2 } from "@dynatrace-sdk/react-hooks";
import { Button } from "@dynatrace/strato-components/buttons";
import { useIntl } from "react-intl";
import { buildQuery } from "../dql/teamsErrorsQuery";
import { formatTs, parseTeamsMap } from "../dql/teamsErrorsUtils";
import {
  TeamsErrorsTable,
  type TeamsErrorRow,
} from "../components/teamsErrors/TeamsErrorsTable";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            {intl.formatMessage(pagesMessages.teamsErrorsTitle)}
          </h2>
          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
            {intl.formatMessage(pagesMessages.teamsErrorsDescription)}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={intl.formatMessage(pagesMessages.teamsErrorsFilterPlaceholder)}
            style={{
              width: 320,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
              outline: "none",
            }}
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
        </div>
      </div>

      {result.isLoading && <div>{intl.formatMessage(pagesMessages.loadingText)}</div>}

      {result.error && (
        <div style={{ color: "crimson" }}>
          {intl.formatMessage(pagesMessages.loadFailedText, {
            error: String(result.error),
          })}
        </div>
      )}

      {!result.isLoading && !result.error && <TeamsErrorsTable rows={rows} />}
    </div>
  );
}
