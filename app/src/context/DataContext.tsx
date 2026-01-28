"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Package,
  Booking,
  TeamMember,
  GalleryItem,
  packages as initialPackages,
  bookings as initialBookings,
  teamMembers as initialTeam,
  gallery as initialGallery,
} from '../../data/mockData';

interface DataContextType {
  // Packages
  packages: Package[];
  addPackage: (pkg: Omit<Package, 'id'>) => void;
  updatePackage: (id: string, pkg: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  
  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  
  // Team
  team: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  
  // Gallery
  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);

  // Package operations
  const addPackage = useCallback((pkg: Omit<Package, 'id'>) => {
    const newPackage: Package = {
      ...pkg,
      id: `pkg-${Date.now()}`,
    };
    setPackages(prev => [...prev, newPackage]);
  }, []);

  const updatePackage = useCallback((id: string, pkg: Partial<Package>) => {
    setPackages(prev =>
      prev.map(p => (p.id === id ? { ...p, ...pkg } : p))
    );
  }, []);

  const deletePackage = useCallback((id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  }, []);

  // Booking operations
  const addBooking = useCallback((booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `book-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setBookings(prev => [...prev, newBooking]);
  }, []);

  const updateBooking = useCallback((id: string, booking: Partial<Booking>) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, ...booking } : b))
    );
  }, []);

  const deleteBooking = useCallback((id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  }, []);

  // Team operations
  const addTeamMember = useCallback((member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `team-${Date.now()}`,
    };
    setTeam(prev => [...prev, newMember]);
  }, []);

  const updateTeamMember = useCallback((id: string, member: Partial<TeamMember>) => {
    setTeam(prev =>
      prev.map(t => (t.id === id ? { ...t, ...member } : t))
    );
  }, []);

  const deleteTeamMember = useCallback((id: string) => {
    setTeam(prev => prev.filter(t => t.id !== id));
  }, []);

  // Gallery operations
  const addGalleryItem = useCallback((item: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
    };
    setGallery(prev => [...prev, newItem]);
  }, []);

  const deleteGalleryItem = useCallback((id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
  }, []);

  const value: DataContextType = {
    packages,
    addPackage,
    updatePackage,
    deletePackage,
    bookings,
    addBooking,
    updateBooking,
    deleteBooking,
    team,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    gallery,
    addGalleryItem,
    deleteGalleryItem,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
