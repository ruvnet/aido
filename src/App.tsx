import React, { useState } from 'react';
import { AgentNetwork } from './components/AgentNetwork/AgentNetwork';
import { DecisionMaking } from './components/DecisionMaking/DecisionMaking';
import { ConsensusAlgorithm } from './components/ConsensusAlgorithm/ConsensusAlgorithm';
import { TaskAllocation } from './components/TaskAllocation/TaskAllocation';
import { PerformanceMonitoring } from './components/PerformanceMonitoring/PerformanceMonitoring';
import './App.css';

type View = 'agents' | 'decisions' | 'consensus' | 'tasks' | 'performance';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('agents');
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  return (
    <div className="app">
      <nav className="navigation">
        <h1>AIDO System</h1>
        <div className="nav-links">
          <button
            className={currentView === 'agents' ? 'active' : ''}
            onClick={() => setCurrentView('agents')}
          >
            Agent Network
          </button>
          <button
            className={currentView === 'decisions' ? 'active' : ''}
            onClick={() => setCurrentView('decisions')}
          >
            Decision Making
          </button>
          <button
            className={currentView === 'consensus' ? 'active' : ''}
            onClick={() => setCurrentView('consensus')}
          >
            Consensus
          </button>
          <button
            className={currentView === 'tasks' ? 'active' : ''}
            onClick={() => setCurrentView('tasks')}
          >
            Task Allocation
          </button>
          <button
            className={currentView === 'performance' ? 'active' : ''}
            onClick={() => setCurrentView('performance')}
          >
            Performance
          </button>
        </div>
      </nav>

      <main className="content">
        {currentView === 'agents' && (
          <AgentNetwork onProposalCreated={setSelectedProposalId} />
        )}
        
        {currentView === 'decisions' && selectedProposalId && (
          <DecisionMaking proposalId={selectedProposalId} />
        )}
        
        {currentView === 'consensus' && selectedProposalId && (
          <ConsensusAlgorithm proposalId={selectedProposalId} />
        )}
        
        {currentView === 'tasks' && (
          <TaskAllocation />
        )}
        
        {currentView === 'performance' && (
          <PerformanceMonitoring />
        )}
      </main>
    </div>
  );
};
