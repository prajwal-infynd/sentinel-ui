import React, { createContext, useContext, useState, useEffect } from 'react';

export type Entity = {
  name: string;
  entity_type: string;
  jurisdiction: string;
  latest_signal: string;
  risk_score: number;
};

export type Case = {
  id: string;
  entity: Entity;
  status: string;
  assignee: string;
  timestamp: string;
};

const defaultCases: Case[] = [
  {
    id: "ALT-KLODEV",
    entity: { name: "Technologies LTD (Klodev)", entity_type: "company", jurisdiction: "UK", latest_signal: "Privacy Policy Discrepancy", risk_score: 98 },
    status: "Pending Review", assignee: "Unassigned", timestamp: "Just now"
  },
  {
    id: "ALT-4891",
    entity: { name: "John Doe", entity_type: "individual", jurisdiction: "UK", latest_signal: "Adverse Media Mention", risk_score: 95 },
    status: "Pending Review", assignee: "Unassigned", timestamp: "10 mins ago"
  },
  {
    id: "ALT-4890",
    entity: { name: "TechNova Corp", entity_type: "company", jurisdiction: "US", latest_signal: "UBO Sanction Match", risk_score: 88 },
    status: "In Progress", assignee: "Sarah K.", timestamp: "2 hours ago"
  },
  {
    id: "ALT-4889",
    entity: { name: "Global Imports Ltd", entity_type: "company", jurisdiction: "UAE", latest_signal: "Unusual Volume Spike", risk_score: 72 },
    status: "In Progress", assignee: "Michael R.", timestamp: "5 hours ago"
  },
  {
    id: "ALT-4888",
    entity: { name: "Elena Rostova", entity_type: "individual", jurisdiction: "CYP", latest_signal: "PEP Status Update", risk_score: 65 },
    status: "Pending Review", assignee: "Unassigned", timestamp: "1 day ago"
  },
  {
    id: "ALT-4885",
    entity: { name: "Apex Trading Group", entity_type: "company", jurisdiction: "SGP", latest_signal: "KYB Document Expiry", risk_score: 45 },
    status: "Resolved", assignee: "System", timestamp: "2 days ago"
  }
];

type InvestigationsContextType = {
  cases: Case[];
  addCase: (newCase: Omit<Case, "id" | "timestamp" | "status" | "assignee">) => string;
  updateCaseStatus: (id: string, status: string) => void;
  assignUser: (id: string, assignee: string) => void;
  getCaseById: (id: string) => Case | undefined;
};

const InvestigationsContext = createContext<InvestigationsContextType | undefined>(undefined);

export const InvestigationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('sentinel_cases');
    let loadedCases = saved ? JSON.parse(saved) : defaultCases;
    
    // Force inject Klodev case so it's immediately visible without clearing local storage
    if (!loadedCases.find((c: Case) => c.id === "ALT-KLODEV")) {
      const klodevCase = defaultCases.find(c => c.id === "ALT-KLODEV");
      if (klodevCase) {
        loadedCases = [klodevCase, ...loadedCases];
      }
    }
    
    return loadedCases;
  });

  useEffect(() => {
    localStorage.setItem('sentinel_cases', JSON.stringify(cases));
  }, [cases]);

  const addCase = (newCaseData: Omit<Case, "id" | "timestamp" | "status" | "assignee">): string => {
    const id = `ALT-${Math.floor(Math.random() * 1000) + 5000}`;
    const newCase: Case = {
      ...newCaseData,
      id,
      status: "Pending Review",
      assignee: "Unassigned",
      timestamp: "Just now"
    };
    setCases(prev => [newCase, ...prev]);
    return id;
  };

  const updateCaseStatus = (id: string, status: string) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const assignUser = (id: string, assignee: string) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, assignee, status: "In Progress" } : c));
  };

  const getCaseById = (id: string) => cases.find(c => c.id === id);

  return (
    <InvestigationsContext.Provider value={{ cases, addCase, updateCaseStatus, assignUser, getCaseById }}>
      {children}
    </InvestigationsContext.Provider>
  );
};

export const useInvestigations = () => {
  const context = useContext(InvestigationsContext);
  if (context === undefined) {
    throw new Error('useInvestigations must be used within an InvestigationsProvider');
  }
  return context;
};
