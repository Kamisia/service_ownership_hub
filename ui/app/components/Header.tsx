import React from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "@dynatrace/strato-components-preview/layouts";
import { useIntl } from "react-intl";
import { componentsMessages } from "./messages";

export const Header = () => {
  const intl = useIntl();

  return (
    <AppHeader>
      <AppHeader.NavItems>
        <AppHeader.AppNavLink as={Link} to="/" />
        <AppHeader.NavItem as={Link} to="/teams">
          {intl.formatMessage(componentsMessages.teamsNavItem)}
        </AppHeader.NavItem>
      </AppHeader.NavItems>
    </AppHeader>
  );
};
