import React, { useDeferredValue, useMemo, useState } from "react";
import { useDql } from "@dynatrace-sdk/react-hooks";
import { Button } from "@dynatrace/strato-components/buttons";
import { Skeleton } from "@dynatrace/strato-components/content";
import { MessageContainer } from "@dynatrace/strato-components-preview/content";
import { TextInput } from "@dynatrace/strato-components-preview/forms";
import { useTeamsOwnership } from "app/hooks/useTeamsOwnership";
import { PageSection } from "app/components/layout/PageSection";
import { AssignTeamModal } from "app/components/teamsErrors/AssignTeamModal";
import {
  TeamsErrorsTable,
  type TeamsErrorRow,
} from "app/components/teamsErrors/TeamsErrorsTable";
import { teamsErrorsMessages } from "app/components/teamsErrors/messages";
import { DEFAULT_ERRORS_LIMIT, buildQuery } from "app/dql/teamsErrorsQuery";
import { formatTs, parseTeamsMap } from "app/dql/teamsErrorsUtils";
import { useIntl } from "react-intl";
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
  const [serviceToAssign, setServiceToAssign] = useState<string>();
  const deferredQueryText = useDeferredValue(q);
  const ownershipResult = useTeamsOwnership();
  const { teams } = ownershipResult;

  const query = useMemo(() => {
    if (ownershipResult.isError) {
      return "";
    }

    const recordsString = parseTeamsMap(teams);
    return buildQuery(recordsString);
  }, [ownershipResult.isError, teams]);

  const result = useDql(
    { query },
    {
      enabled: !ownershipResult.isLoading && !ownershipResult.isError && Boolean(query),
      staleTime: 60 * 1000,
    },
  );

  const rowsAll = useMemo((): TeamsErrorRow[] => {
    const records = (result.data?.records ?? []) as RawDqlRecord[];

    return records.map((record) => ({
      timestampText: formatTs(record.timestamp),
      content: record.content ?? "",
      isAssigned: Boolean(record.team?.trim()),
      team:
        record.team?.trim() ||
        intl.formatMessage(teamsErrorsMessages.unassignedTeam),
      serviceName: record["service.name"] ?? "",
    }));
  }, [intl, result.data]);

  const rows = useMemo(() => {
    const queryText = deferredQueryText.trim().toLowerCase();
    if (!queryText) return rowsAll;

    return rowsAll.filter((row) => {
      return (
        row.serviceName.toLowerCase().includes(queryText) ||
        row.team.toLowerCase().includes(queryText) ||
        row.content.toLowerCase().includes(queryText)
      );
    });
  }, [rowsAll, deferredQueryText]);

  const isInitialLogsLoading = result.isLoading && !result.data;

  const handleRefresh = () => {
    if (ownershipResult.isError) {
      return ownershipResult.refetch();
    }

    return ownershipResult
      .refetch()
      .then(() => result.forceRefetch({ cancelRefetch: true }));
  };

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
            disabled={ownershipResult.isError}
          />
          <Button
            onClick={() => {
              void handleRefresh().catch((e) => console.error("Refresh failed:", e));
            }}
            disabled={ownershipResult.isLoading || result.isFetching}
          >
            {intl.formatMessage(
              result.isFetching
                ? pagesMessages.refreshingButton
                : pagesMessages.refreshButton,
            )}
          </Button>
        </>
      }
    >
      {ownershipResult.isLoading && !ownershipResult.data && (
        <>
          <Skeleton />
          <div>{intl.formatMessage(pagesMessages.ownershipLoadingText)}</div>
        </>
      )}

      {ownershipResult.isError && (
        <MessageContainer variant="critical">
          <MessageContainer.Title>Error</MessageContainer.Title>
          <MessageContainer.Description>
            {intl.formatMessage(pagesMessages.ownershipLoadFailedText, {
              error: String(ownershipResult.error),
            })}
          </MessageContainer.Description>
        </MessageContainer>
      )}

      {!ownershipResult.isError && isInitialLogsLoading && (
        <>
          <Skeleton />
          <div>{intl.formatMessage(pagesMessages.loadingText)}</div>
        </>
      )}

      {!ownershipResult.isError && result.error && (
        <MessageContainer variant="critical">
          <MessageContainer.Title>Error</MessageContainer.Title>
          <MessageContainer.Description>
            {intl.formatMessage(pagesMessages.loadFailedText, {
              error: String(result.error),
            })}
          </MessageContainer.Description>
        </MessageContainer>
      )}

      {!ownershipResult.isError && !isInitialLogsLoading && !result.error && (
        <>
          <div>
            {intl.formatMessage(pagesMessages.resultSummaryText, {
              count: rows.length,
            })}
            {" "}
            ({DEFAULT_ERRORS_LIMIT} max)
          </div>
          {rows.length === 0 ? (
            <MessageContainer variant="neutral">
              <MessageContainer.Title>
                {intl.formatMessage(pagesMessages.noLogsText)}
              </MessageContainer.Title>
            </MessageContainer>
          ) : (
            <TeamsErrorsTable
              rows={rows}
              onAssignTeam={(row) => setServiceToAssign(row.serviceName)}
            />
          )}
        </>
      )}

      {serviceToAssign && (
        <AssignTeamModal
          teams={teams ?? []}
          serviceName={serviceToAssign}
          closeDialog={() => setServiceToAssign(undefined)}
          afterAssign={() =>
            handleRefresh().then(() => {
              setServiceToAssign(undefined);
            })
          }
        />
      )}
    </PageSection>
  );
}
