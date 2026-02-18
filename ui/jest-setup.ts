import "@testing-library/jest-dom";

jest.mock("@dynatrace-sdk/user-preferences", () => ({
  getTimezone: () => "UTC",
}));

jest.mock("react-intl", () => {
  const actual = jest.requireActual<typeof import("react-intl")>("react-intl");

  return {
    ...actual,
    useIntl: () => ({
      formatMessage: (
        descriptor: { defaultMessage?: string; id?: string },
        values?: Record<string, string | number | boolean | null | undefined>,
      ) => {
        const template = descriptor.defaultMessage ?? descriptor.id ?? "";
        if (!values) {
          return template;
        }

        return template.replace(
          /\{(\w+)\}/g,
          (_match: string, key: string) => String(values[key] ?? ""),
        );
      },
    }),
  };
});
