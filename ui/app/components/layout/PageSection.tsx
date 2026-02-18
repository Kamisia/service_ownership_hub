import React from "react";
import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";

export function PageSection({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Flex flexDirection="column" gap={16} maxWidth="1200px">
      <Flex alignItems="baseline" justifyContent="space-between" gap={12}>
        <Flex flexDirection="column">
          <Heading as="h2" level={2}>
            {title}
          </Heading>
          {description ? <Paragraph>{description}</Paragraph> : null}
        </Flex>

        {right ? <Flex gap={8}>{right}</Flex> : null}
      </Flex>

      {children}
    </Flex>
  );
}
