// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './loadout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashBoardPage';
import PurchasesPage from './pages/PurchasePage';
import TransfersPage from './pages/TransferPage';
import AssignmentsPage from './pages/AssessmentsPage';
import ExpendituresPage from './pages/ExpendituresPage';
import LogsPage from './pages/LogsPage';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/purchases"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'COMMANDER', 'LOGISTICS']}>
              <MainLayout>
                <PurchasesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transfers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'COMMANDER', 'LOGISTICS']}>
              <MainLayout>
                <TransfersPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'COMMANDER']}>
              <MainLayout>
                <AssignmentsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenditures"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'COMMANDER']}>
              <MainLayout>
                <ExpendituresPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'COMMANDER', 'LOGISTICS']}>
              <MainLayout>
                <LogsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
