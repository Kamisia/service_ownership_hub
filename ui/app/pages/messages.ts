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
    defaultMessage: "Filter by service, team, content…",
  },
  refreshButton: {
    id: "pages.teamsErrors.actions.refresh",
    defaultMessage: "Refresh",
  },
  loadingText: {
    id: "pages.teamsErrors.loading",
    defaultMessage: "Loading…",
  },
  loadFailedText: {
    id: "pages.teamsErrors.failed",
    defaultMessage: "Failed to load logs: {error}",
  },
});
