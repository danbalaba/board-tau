import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MapActionSidebar from '../MapActionSidebar';

describe('MapActionSidebar Component', () => {
  const mockSetActiveView = jest.fn();
  const mockOnMenuClick = jest.fn();
  const mockOnSavedClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders desktop and mobile navigation buttons', () => {
    render(
      <MapActionSidebar 
        activeView="list" 
        setActiveView={mockSetActiveView} 
        onMenuClick={mockOnMenuClick}
      />
    );
    
    // Should render two 'Saved' texts (one for desktop, one for mobile)
    const savedButtons = screen.getAllByText('Saved');
    expect(savedButtons.length).toBe(2);

    const recentsButtons = screen.getAllByText('Recents');
    expect(recentsButtons.length).toBe(2);
  });

  it('calls onMenuClick when menu button is clicked (desktop)', () => {
    render(
      <MapActionSidebar 
        activeView="list" 
        setActiveView={mockSetActiveView} 
        onMenuClick={mockOnMenuClick}
      />
    );
    
    const menuButton = screen.getByTitle('Menu');
    fireEvent.click(menuButton);
    expect(mockOnMenuClick).toHaveBeenCalled();
  });

  it('calls onSavedClick when saved button is clicked if provided', () => {
    render(
      <MapActionSidebar 
        activeView="list" 
        setActiveView={mockSetActiveView} 
        onSavedClick={mockOnSavedClick}
      />
    );
    
    const savedButton = screen.getByTitle('Saved');
    fireEvent.click(savedButton);
    expect(mockOnSavedClick).toHaveBeenCalled();
  });

  it('calls setActiveView when recents button is clicked', () => {
    render(
      <MapActionSidebar 
        activeView="list" 
        setActiveView={mockSetActiveView} 
      />
    );
    
    const recentsButton = screen.getByTitle('Recents');
    fireEvent.click(recentsButton);
    // Fixed: State payload correctly binds to the recents view
    expect(mockSetActiveView).toHaveBeenCalledWith('recents');
  });

  it('toggles view to "none" if clicking the active view', () => {
    render(
      <MapActionSidebar 
        activeView="recents" 
        setActiveView={mockSetActiveView} 
      />
    );
    
    const recentsButton = screen.getByTitle('Recents');
    fireEvent.click(recentsButton);
    expect(mockSetActiveView).toHaveBeenCalledWith('none');
  });
});
