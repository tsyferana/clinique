import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { UserDTO, PatientDTO, DoctorDTO, AuthResponseDTO } from '../types/index.js';

interface AuthContextType {
  user: UserDTO | null;
  patientProfile: PatientDTO | null;
  doctorProfile: DoctorDTO | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickSwitchAccount: (role: 'PATIENT' | 'STAFF' | 'DOCTOR' | 'ADMIN') => Promise<void>;
  updateDoctorProfileState: (data: { user: UserDTO; doctorProfile: DoctorDTO }) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientDTO | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorDTO | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMe = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get<AuthResponseDTO>('/auth/me');
      setUser(res.data.user);
      setPatientProfile(res.data.patientProfile || null);
      setDoctorProfile(res.data.doctorProfile || null);
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [token]);

  const updateDoctorProfileState = (data: { user: UserDTO; doctorProfile: DoctorDTO }) => {
    setUser(data.user);
    setDoctorProfile(data.doctorProfile);
  };

  const refreshUser = async () => {
    await fetchMe();
  };

  const handleAuthResponse = (data: AuthResponseDTO) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setPatientProfile(data.patientProfile || null);
    setDoctorProfile(data.doctorProfile || null);
  };

  const login = async (email: string, pass: string) => {
    const res = await api.post<AuthResponseDTO>('/auth/login', { email, password: pass });
    handleAuthResponse(res.data);
  };

  const register = async (formData: any) => {
    const res = await api.post<AuthResponseDTO>('/auth/register', formData);
    handleAuthResponse(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPatientProfile(null);
    setDoctorProfile(null);
  };

  const quickSwitchAccount = async (role: 'PATIENT' | 'STAFF' | 'DOCTOR' | 'ADMIN') => {
    const emailMap = {
      PATIENT: 'patient@example.com',
      STAFF: 'accueil@clinique.com',
      DOCTOR: 'dr.dupont@clinique.com',
      ADMIN: 'admin@clinique.com',
    };
    await login(emailMap[role], 'clinique2026');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patientProfile,
        doctorProfile,
        token,
        loading,
        login,
        register,
        logout,
        quickSwitchAccount,
        updateDoctorProfileState,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l intérieur d un AuthProvider');
  }
  return context;
};
