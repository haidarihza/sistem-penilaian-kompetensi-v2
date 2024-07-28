// src/__ tests __/Competency.test.tsx

import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Detail from '../pages/room/RoomDetail';
import InterviewModal from '../pages/room/InterviewModal';
import RoomCard from '../pages/room/RoomCard';
import ListView from '../pages/room/ListView';
import theme from '../Theme';

const mockQuestion = {
  id: '1',
  question: 'Test Question?',
  duration_limit: 30,
  org_position: '',
  start_answer: '',
  labels: [],
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

const mockRoomGroup = {
  id: '1',
  title: 'Test Room Group',
  interviewee_name: 'Test Interviewee',
  interviewee_email: 'test@gmail.com',
  interviewee_phone: '08123456789',
  org_position: 'Test Position',
  room: [
    {
      id: '1',
      title: 'Test Room',
      interviewer_name: 'Test Interviewer',
      start: '2021-08-01T00:00:00Z',
      end: '2021-08-01T01:00:00Z',
      submission: '2021-08-01T00:30:00Z',
      status: 'PENDING',
    }
  ],
};

const mockRoomDetail = {
  id: '1',
  title: 'Test Room',
  interviewer_name: 'Test Interviewer',
  start: '2021-08-01T00:00:00Z',
  end: '2021-08-01T01:00:00Z',
  submission: '2021-08-01T00:30:00Z',
  status: 'PENDING',
  description: 'Test Description',
  interviewer_email: 'testing',
  language: 'Bahasa Indonesia',
  is_started: false,
  current_question: 0,
  note: 'Test Note',
  questions: [mockQuestion],
  competencies: [mockCompetency],
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

describe('RoomDetail', () => {
  test('renders the detail', async() => {
    renderWithProviders(
      <Detail
        roomGroup={mockRoomGroup}
        room_id='1'
        updateRoomGroup={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(true).toBeTruthy()
    });      
  });
});

describe('InterviewModal', () => {
  test('renders the modal', async() => {
    renderWithProviders(
      <InterviewModal
        isOpen={true}
        onClose={jest.fn()}
        room={mockRoomDetail}
        setRoom={jest.fn()}
        questions={[mockQuestion]}
        updateRoom={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(true).toBeTruthy()
    });
  });
});

describe('RoomCard', () => {
  test('renders the card', () => {
    renderWithProviders(
      <RoomCard
        roomGroup={mockRoomGroup}
        handleDeleteConfirm={jest.fn()}
        role={'INTERVIEWER'}
      />
    );

    expect(true).toBeTruthy()
  });
});

describe('ListView', () => {
  test('renders the list view', () => {
    renderWithProviders(
      <ListView
      filteredData={[mockRoomGroup]}
        role={'INTERVIEWER'}
        handleDeleteConfirm={jest.fn()}
      />
    );

    expect(true).toBeTruthy()
  });
});