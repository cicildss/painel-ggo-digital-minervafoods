import React, { createContext, useContext, useState, useEffect } from 'react';
import metadataData from '../data/metadata.json';
import type { Metadata } from '../types';

interface AuthUser {
  name: string;
  email: string;
  role: 'ADMIN' | 'GESTOR';
  roleTitle: string;
  hasFullAccess: boolean;
  costCenters: string[];
  macroarea?: string;
  negocio?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string) => { success: boolean; message?: string };
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const metadata = metadataData as unknown as Metadata;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there is an active session
    const savedEmail = localStorage.getItem('minerva_ggo_user_email');
    if (savedEmail) {
      authenticateEmail(savedEmail);
    } else {
      // Default initial session for Maria Almeida (Admin)
      authenticateEmail('maria.almeida@minervafoods.com');
    }
    setIsLoading(false);
  }, []);

  const authenticateEmail = (rawEmail: string): { success: boolean; message?: string } => {
    const email = rawEmail.trim().toLowerCase();
    if (!email) {
      return { success: false, message: 'Por favor, informe seu e-mail corporativo.' };
    }

    // Check if admin
    const isAdmin = metadata.admins.map((a) => a.toLowerCase()).includes(email);
    if (isAdmin) {
      const authUser: AuthUser = {
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        role: 'ADMIN',
        roleTitle: 'Administrador da Controladoria Corporativa',
        hasFullAccess: true,
        costCenters: []
      };
      setUser(authUser);
      localStorage.setItem('minerva_ggo_user_email', email);
      return { success: true };
    }

    // Check if gestor in matrix
    const gestor = metadata.gestores.find((g) => g.email.toLowerCase() === email);
    if (gestor && gestor.cost_centers && gestor.cost_centers.length > 0) {
      const authUser: AuthUser = {
        name: gestor.name || email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        role: 'GESTOR',
        roleTitle: gestor.role || 'Gestor de Centros de Custo',
        hasFullAccess: false,
        costCenters: gestor.cost_centers,
        macroarea: gestor.macro,
        negocio: gestor.negocio
      };
      setUser(authUser);
      localStorage.setItem('minerva_ggo_user_email', email);
      return { success: true };
    }

    return {
      success: false,
      message: 'E-mail não autorizado ou sem centros de custo atribuídos na matriz de gestores.'
    };
  };

  const login = (email: string) => {
    return authenticateEmail(email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('minerva_ggo_user_email');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
