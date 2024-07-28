// src/__ tests __/Feedback.test.tsx

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import DetailFeedbackModal from '../pages/feedback/DetailFeedbackModal';
import theme from '../Theme';

const mockFeedback = {
  id: '1',
  competency_id: '1',
  transcript: 'Test Transcript',
  status: 'LABELED',
  label_result: '1',
  label_feedback: '2',
};

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

describe('DetailFeedbackModal', () => {
  test('renders the modal with correct title and button content', () => {
    renderWithProviders(
      <DetailFeedbackModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        title="Test Modal"
        feedback={mockFeedback}
        competency={mockCompetency}
        setFeedback={jest.fn()}
      />
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  test('renders all fields', () => {
    renderWithProviders(
      <DetailFeedbackModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        title="Test Modal"
        feedback={mockFeedback}
        competency={mockCompetency}
        setFeedback={jest.fn()}
      />
    );

    expect(screen.getByText('Transkrip Interview')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });
});