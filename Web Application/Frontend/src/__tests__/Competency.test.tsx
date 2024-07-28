// src/__ tests __/Competency.test.tsx

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import CompetencyModal from '../pages/competency/CompetencyModal';
import DetailsCompetencyModal from '../pages/competency/DetailsCompetencyModal';
import theme from '../Theme';

const mockCompetency = {
  id: '1',
  competency: 'Test Competency',
  description: 'Test Description',
  category: 'Teknis',
  levels: [
    { id:'1', level: 'Level 1', description: 'Description 1' },
    { id:'2', level: 'Level 2', description: 'Description 2' },
  ],
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      <Router>
        {ui}
      </Router>
    </ChakraProvider>
  );
};

describe('CompetencyModal', () => {
  test('renders the modal with correct title and button content', () => {
    renderWithProviders(
      <CompetencyModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        title="Test Modal"
        buttonContent="Submit"
        competency={mockCompetency}
        setCompetency={jest.fn()}
      />
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('renders all fields', () => {
    renderWithProviders(
      <CompetencyModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        title="Test Modal"
        buttonContent="Submit"
        competency={mockCompetency}
        setCompetency={jest.fn()}
      />
    );

    expect(screen.getByText('Kompetensi')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi')).toBeInTheDocument();
    expect(screen.getByText('Kategori')).toBeInTheDocument();
  });
});

describe('DetailsCompetencyModal', () => {
  test('renders the modal with correct title', () => {
    renderWithProviders(
      <DetailsCompetencyModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        competency={mockCompetency}
      />
    );

    expect(screen.getByText('Test Competency')).toBeInTheDocument();
  });

  test('renders all fields', () => {
    renderWithProviders(
      <DetailsCompetencyModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        competency={mockCompetency}
      />
    );

    expect(screen.getByText('Test Competency')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });
});