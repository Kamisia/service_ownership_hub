import { defineMessages } from "react-intl";

export const teamsMessages = defineMessages({
  addTeamTitle: {
    id: "teams.create.title",
    defaultMessage: "Add team",
  },
  editTeamTitle: {
    id: "teams.edit.title",
    defaultMessage: "Edit team: {teamName}",
  },
  deleteTeamTitle: {
    id: "teams.delete.title",
    defaultMessage: "Delete team",
  },
  teamNameLabel: {
    id: "teams.form.teamName.label",
    defaultMessage: "Team name",
  },
  teamNamePlaceholder: {
    id: "teams.form.teamName.placeholder",
    defaultMessage: "e.g. Platform Team",
  },
  servicesSectionTitle: {
    id: "teams.form.services.title",
    defaultMessage: "Services",
  },
  createNoServicesText: {
    id: "teams.create.services.empty",
    defaultMessage: "No services added yet.",
  },
  editNoServicesText: {
    id: "teams.edit.services.empty",
    defaultMessage: "No services.",
  },
  createServicePlaceholder: {
    id: "teams.create.services.placeholder",
    defaultMessage: "e.g. auth-service",
  },
  editServicePlaceholder: {
    id: "teams.edit.services.placeholder",
    defaultMessage: "e.g. payments-api",
  },
  addButton: {
    id: "teams.actions.add",
    defaultMessage: "Add",
  },
  cancelButton: {
    id: "teams.actions.cancel",
    defaultMessage: "Cancel",
  },
  createButton: {
    id: "teams.actions.create",
    defaultMessage: "Create",
  },
  saveButton: {
    id: "teams.actions.save",
    defaultMessage: "Save",
  },
  deleteButton: {
    id: "teams.actions.delete",
    defaultMessage: "Delete",
  },
  editButton: {
    id: "teams.actions.edit",
    defaultMessage: "Edit",
  },
  addTeamButton: {
    id: "teams.page.addTeam",
    defaultMessage: "Add team +",
  },
  teamNameRequiredError: {
    id: "teams.validation.teamNameRequired",
    defaultMessage: "Team name is required.",
  },
  teamNameUniqueError: {
    id: "teams.validation.teamNameUnique",
    defaultMessage: "Team name must be unique.",
  },
  createTeamFailedError: {
    id: "teams.create.failed",
    defaultMessage: "Failed to create team.",
  },
  deleteTeamConfirmation: {
    id: "teams.delete.confirmation",
    defaultMessage: 'Are you sure you want to delete "{teamName}" team?',
  },
  tableTeamHeader: {
    id: "teams.table.header.team",
    defaultMessage: "Team",
  },
  tableServicesHeader: {
    id: "teams.table.header.services",
    defaultMessage: "Services",
  },
  tableActionsHeader: {
    id: "teams.table.header.actions",
    defaultMessage: "Actions",
  },
  tableNoServicesText: {
    id: "teams.table.noServices",
    defaultMessage: "No services",
  },
  serviceAlreadyAssignedError: {
    id: "service.already.assigned.error",
    defaultMessage: "Service is already assigned to another team.",
  },
  serviceSuggestionsLabel: {
    id: "teams.services.suggestions.label",
    defaultMessage: "Suggestions",
  },
  serviceSuggestionsLoading: {
    id: "teams.services.suggestions.loading",
    defaultMessage: "Loading suggestions...",
  },
});
