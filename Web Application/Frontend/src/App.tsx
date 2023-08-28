import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './provider/AuthProvider';
import APIProvider from './provider/APIProvider';
import { ChakraProvider, Spinner } from '@chakra-ui/react';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/auth/Profile'));
const Dashboard = lazy(() => import('./pages/room/Index'));
const RoomDetail = lazy(() => import('./pages/room/Detail'));
const Question = lazy(() => import('./pages/question/Index'));
const Competency = lazy(() => import('./pages/competency/Index'));
const RoomCreate = lazy(() => import('./pages/room/Create'));

const App = () => (
  <ChakraProvider>
    <AuthProvider>
      <APIProvider>
        <Router>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/room/:id" element={<RoomDetail />} />
              <Route path="/room/create" element={<RoomCreate />} />
              <Route path="/question" element={<Question />} />
              <Route path="/competency" element={<Competency />} />
            </Routes>
          </Suspense>
        </Router>
      </APIProvider>
    </AuthProvider>
  </ChakraProvider>
);

export default App;
