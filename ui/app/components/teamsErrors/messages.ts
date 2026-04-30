import { defineMessages } from "react-intl";

export const teamsErrorsMessages = defineMessages({
  timestampHeader: {
    id: "teamsErrors.table.header.timestamp",
    defaultMessage: "Timestamp",
  },
  serviceHeader: {
    id: "teamsErrors.table.header.service",
    defaultMessage: "Service",
  },
  teamHeader: {
    id: "teamsErrors.table.header.team",
    defaultMessage: "Team",
  },
  contentHeader: {
    id: "teamsErrors.table.header.content",
    defaultMessage: "Content",
  },
  actionsHeader: {
    id: "teamsErrors.table.header.actions",
    defaultMessage: "Actions",
  },
  unassignedTeam: {
    id: "teamsErrors.table.team.unassigned",
    defaultMessage: "Unassigned",
  },
  assignTeamButton: {
    id: "teamsErrors.actions.assignTeam",
    defaultMessage: "Assign team",
  },
  assignTeamModalTitle: {
    id: "teamsErrors.assign.modal.title",
    defaultMessage: "Assign team to service",
  },
  assignTeamModalDescription: {
    id: "teamsErrors.assign.modal.description",
    defaultMessage: 'Choose which team should own "{serviceName}".',
  },
  assignExistingMode: {
    id: "teamsErrors.assign.modal.mode.existing",
    defaultMessage: "Use existing team",
  },
  createNewMode: {
    id: "teamsErrors.assign.modal.mode.new",
    defaultMessage: "Create new team",
  },
  chooseTeamLabel: {
    id: "teamsErrors.assign.modal.chooseTeam",
    defaultMessage: "Available teams",
  },
  newTeamLabel: {
    id: "teamsErrors.assign.modal.newTeam.label",
    defaultMessage: "New team name",
  },
  newTeamHint: {
    id: "teamsErrors.assign.modal.newTeam.hint",
    defaultMessage: "The current service will be added automatically to the new team.",
  },
  noTeamsTitle: {
    id: "teamsErrors.assign.modal.noTeams.title",
    defaultMessage: "No teams available.",
  },
  noTeamsDescription: {
    id: "teamsErrors.assign.modal.noTeams.description",
    defaultMessage: "Create a team first, then come back to assign this service.",
  },
  assignConfirmButton: {
    id: "teamsErrors.assign.modal.confirm",
    defaultMessage: "Assign",
  },
  assigningButton: {
    id: "teamsErrors.assign.modal.assigning",
    defaultMessage: "Assigning...",
  },
  assignFailedError: {
    id: "teamsErrors.assign.modal.failed",
    defaultMessage: "Failed to assign the service to the selected team.",
  },
  versionConflictError: {
    id: "teamsErrors.assign.modal.versionConflict",
    defaultMessage:
      "The team data changed in the meantime. Refresh the page and try again.",
  },
});
