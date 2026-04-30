import { defineMessages } from "react-intl";

export const pagesMessages = defineMessages({
  teamsPageTitle: {
    id: "pages.teams.title",
    defaultMessage: "Teams",
  },
  teamsPageDescription: {
    id: "pages.teams.description",
    defaultMessage: "Manage team ownership and associated services.",
  },
  teamsPageLoadFailed: {
    id: "pages.teams.failed",
    defaultMessage: "Failed to load team ownership data: {error}",
  },
  teamsPageRetryButton: {
    id: "pages.teams.retry",
    defaultMessage: "Retry",
  },
  teamsErrorsTitle: {
    id: "pages.teamsErrors.title",
    defaultMessage: "Teams errors",
  },
  teamsErrorsDescription: {
    id: "pages.teamsErrors.description",
    defaultMessage:
      "ERROR logs enriched with ownership based on your Teams configuration.",
  },
  teamsErrorsFilterPlaceholder: {
    id: "pages.teamsErrors.filter.placeholder",
    defaultMessage: "Filter by service, team, content...",
  },
  refreshButton: {
    id: "pages.teamsErrors.actions.refresh",
    defaultMessage: "Refresh",
  },
  refreshingButton: {
    id: "pages.teamsErrors.actions.refreshing",
    defaultMessage: "Refreshing...",
  },
  loadingText: {
    id: "pages.teamsErrors.loading",
    defaultMessage: "Loading...",
  },
  loadFailedText: {
    id: "pages.teamsErrors.failed",
    defaultMessage: "Failed to load logs: {error}",
  },
  ownershipLoadFailedText: {
    id: "pages.teamsErrors.ownership.failed",
    defaultMessage: "Failed to load ownership mapping: {error}",
  },
  ownershipLoadingText: {
    id: "pages.teamsErrors.ownership.loading",
    defaultMessage: "Loading ownership mapping...",
  },
  noLogsText: {
    id: "pages.teamsErrors.empty",
    defaultMessage: "No matching ERROR logs were found for the selected timeframe.",
  },
  resultSummaryText: {
    id: "pages.teamsErrors.summary",
    defaultMessage: "{count, number} error rows loaded",
  },
});
