import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './provider/AuthProvider';
import APIProvider from './provider/APIProvider';
import { ChakraProvider, Spinner } from '@chakra-ui/react';
import theme from './Theme';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/auth/Profile'));
const VerifyEmail = lazy(() => import('./pages/auth/EmailVerification'));
const Dashboard = lazy(() => import('./pages/room/Index'));
const RoomGroupDetail = lazy(() => import('./pages/room/RoomGroupDetail'));
const Question = lazy(() => import('./pages/question/Index'));
const Competency = lazy(() => import('./pages/competency/Index'));
const RoomCreate = lazy(() => import('./pages/room/CreateRoom'));
const Feedback = lazy(() => import('./pages/feedback/Index'));

const App = () => (
  <ChakraProvider theme={theme}>
    <AuthProvider>
      <APIProvider>
        <Router>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth/verify-email" element={<VerifyEmail />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/room-group/:id" element={<RoomGroupDetail />} />
              <Route path="/room/create" element={<RoomCreate />} />
              <Route path="/room/edit/:id" element={<RoomCreate />} />
              <Route path="/question" element={<Question />} />
              <Route path="/competency" element={<Competency />} />
              <Route path="/feedback" element={<Feedback />} />
            </Routes>
          </Suspense>
        </Router>
      </APIProvider>
    </AuthProvider>
  </ChakraProvider>
);

export default App;
