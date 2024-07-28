// src/__ tests __/Question.test.tsx

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import QuestionModal from '../pages/question/QuestionModal';
import theme from '../Theme';

const mockQuestion = {
  id: '1',
  question: 'Test Question?',
  duration_limit: 30,
  org_position: '',
  start_answer: '',
  labels: [],
};

const mockLabelOptions = [
  { id: '1', competency: 'Competency 1' },
  { id: '2', competency: 'Competency 2' },
];

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      <Router>
        {ui}
      </Router>
    </ChakraProvider>
  );
};

describe('QuestionModal', () => {
  test('renders the modal with correct title and button content', () => {
    renderWithProviders(
      <QuestionModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        title="Test Modal"
        buttonContent="Submit"
        question={mockQuestion}
        labelOptions={mockLabelOptions}
        setQuestion={jest.fn()}
      />
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('renders all fields', () => {
    renderWithProviders(
      <QuestionModal
        isOpen={true}
        onClose={jest.fn()}
        handleSubmit={jest.fn()}
        title="Test Modal"
        buttonContent="Submit"
        question={mockQuestion}
        labelOptions={mockLabelOptions}
        setQuestion={jest.fn()}
      />
    );

    expect(screen.getByText('Pertanyaan')).toBeInTheDocument();
    expect(screen.getByText('Durasi (menit)')).toBeInTheDocument();
    expect(screen.getByText('Posisi Organisasi')).toBeInTheDocument();
    expect(screen.getByText('Kategori Kompetensi')).toBeInTheDocument();
  });
});