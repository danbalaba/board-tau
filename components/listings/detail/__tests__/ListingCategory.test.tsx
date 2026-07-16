import React from 'react';
import { render, screen } from '@testing-library/react';
import ListingCategory from '../ListingCategory';

describe('ListingCategory', () => {
  const MockIcon = (props: any) => <svg data-testid="mock-icon" {...props} />;

  it('renders correctly', () => {
    render(
      <ListingCategory
        icon={MockIcon}
        label="Test Category"
        description="This is a test description"
      />
    );

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });
});
