import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock ResizeObserver for LocationStep map component
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};


// Import all Steps and Components
import CollegeStep from '../search-modal/steps/CollegeStep';
import BudgetStep from '../search-modal/steps/BudgetStep';
import AdvancedStep from '../search-modal/steps/AdvancedStep';
import AmenitiesStep from '../search-modal/steps/AmenitiesStep';
import BedSetupStep from '../search-modal/steps/BedSetupStep';
import CategoryStep from '../search-modal/steps/CategoryStep';
import LocationStep from '../search-modal/steps/LocationStep';
import RoomAmenitiesStep from '../search-modal/steps/RoomAmenitiesStep';
import RoomConfigStep from '../search-modal/steps/RoomConfigStep';
import RoomTypeStep from '../search-modal/steps/RoomTypeStep';
import RulesStep from '../search-modal/steps/RulesStep';
import SummaryStep from '../search-modal/steps/SummaryStep';

import StepButton from '../search-modal/components/StepButton';
import ProgressBar from '../search-modal/components/ProgressBar';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, ...rest } = props;
    return <div ref={ref} {...rest} />;
  });
  return {
    motion: { div: Dummy },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock('@/components/common/Button', () => {
  return function MockButton({ children, onClick, type, disabled, className }: any) {
    return (
      <button type={type} onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    );
  };
});

describe('SearchModal Comprehensive Component Tests', () => {

  describe('CollegeStep', () => {
    it('renders correctly', () => {
      render(<CollegeStep college="any" setCustomValue={jest.fn()} />);
      expect(screen.getByText('Which college are you affiliated with?')).toBeInTheDocument();
    });
  });

  describe('BudgetStep', () => {
    it('displays an error if minimum price is greater than maximum price', () => {
      render(
        <BudgetStep register={jest.fn() as any} errors={{}} watch={jest.fn() as any} minPrice="5000" maxPrice="1000" />
      );
      expect(screen.getByText('Minimum price cannot be greater than maximum price')).toBeInTheDocument();
    });

    it('does not display an error if budget is valid', () => {
      render(
        <BudgetStep register={jest.fn() as any} errors={{}} watch={jest.fn() as any} minPrice="1000" maxPrice="5000" />
      );
      expect(screen.queryByText('Minimum price cannot be greater than maximum price')).not.toBeInTheDocument();
    });
  });

  describe('AdvancedStep', () => {
    it('renders correctly', () => {
      render(<AdvancedStep advancedSelected={[]} toggleMulti={jest.fn()} />);
      expect(screen.getByText('Looking for advanced features?')).toBeInTheDocument();
    });
  });

  describe('AmenitiesStep', () => {
    it('renders correctly', () => {
      render(<AmenitiesStep amenitiesSelected={[]} toggleMulti={jest.fn()} />);
      
      // Fixed the intentional error for the final screenshot!
      expect(screen.getByText('Listing Amenities')).toBeInTheDocument();
    });
  });

  describe('BedSetupStep', () => {
    it('renders correctly', () => {
      render(<BedSetupStep bedType="" roomType="" register={jest.fn() as any} errors={{}} watch={jest.fn() as any} setCustomValue={jest.fn()} />);
      // It should just render without crashing
    });
  });

  describe('CategoryStep', () => {
    it('renders correctly', () => {
      render(<CategoryStep categoriesSelected={[]} toggleMulti={jest.fn()} />);
      expect(screen.getByText('Listing Categories')).toBeInTheDocument();
    });
  });

  describe('LocationStep', () => {
    it('renders correctly', () => {
      render(
        <LocationStep 
          distance={5} 
          setCustomValue={jest.fn()} 
          watch={jest.fn() as any}
          college="any"
          register={jest.fn() as any}
        />
      );
      expect(screen.getByText('Where should the boarding house be located?')).toBeInTheDocument();
    });
  });

  describe('RoomAmenitiesStep', () => {
    it('renders correctly', () => {
      render(<RoomAmenitiesStep roomType="" roomAmenitiesSelected={[]} toggleMulti={jest.fn()} />);
      // Should render without crashing
    });
  });

  describe('RoomTypeStep', () => {
    it('renders correctly', () => {
      render(<RoomTypeStep roomType="" setCustomValue={jest.fn()} />);
      expect(screen.getByText('Select Room Type')).toBeInTheDocument();
    });
  });

  describe('RulesStep', () => {
    it('renders correctly', () => {
      render(<RulesStep rulesSelected={[]} toggleMulti={jest.fn()} />);
      expect(screen.getByText('Rules / Preferences')).toBeInTheDocument();
    });
  });

  describe('ProgressBar', () => {
    it('renders without crashing', () => {
      const mockSteps = [{ id: 0, label: "College" }];
      const { container } = render(<ProgressBar steps={mockSteps} currentStepId={0} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('StepButton', () => {
    it('disables button when not filled', () => {
      render(<StepButton step={0} totalSteps={5} isFilled={false} onNext={jest.fn()} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

});
