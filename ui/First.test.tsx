// imports
import React from 'react';
import { render } from '@dynatrace/strato-components-preview-testing/jest';
import { screen } from '@testing-library/react';

// component
import { Heading } from '@dynatrace/strato-components/typography';
type TestHeadingProps = {
  textValue: string;
};

const TestHeading = ({ textValue }: TestHeadingProps) => {
  return <Heading level={1}>{textValue}</Heading>;
};

// test
describe('Heading component', () => {
  test('should render the Unit test on screen', () => {
    render(<TestHeading textValue="Unit test" />);
    expect(screen.getByText('Unit test')).toBeInTheDocument();
  });
});
