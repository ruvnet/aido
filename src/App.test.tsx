import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';

// Mock all child components
vi.mock('./components/AgentNetwork/AgentNetwork', () => ({
  AgentNetwork: ({ onProposalCreated }: { onProposalCreated: (id: string) => void }) => (
    <div data-testid="agent-network">
      Agent Network Mock
      <button onClick={() => onProposalCreated('test-proposal-1')}>Create Proposal</button>
    </div>
  )
}));

vi.mock('./components/DecisionMaking/DecisionMaking', () => ({
  DecisionMaking: ({ proposalId }: { proposalId: string }) => (
    <div data-testid="decision-making">Decision Making Mock (Proposal: {proposalId})</div>
  )
}));

vi.mock('./components/ConsensusAlgorithm/ConsensusAlgorithm', () => ({
  ConsensusAlgorithm: ({ proposalId }: { proposalId: string }) => (
    <div data-testid="consensus-algorithm">Consensus Algorithm Mock (Proposal: {proposalId})</div>
  )
}));

vi.mock('./components/TaskAllocation/TaskAllocation', () => ({
  TaskAllocation: () => <div data-testid="task-allocation">Task Allocation Mock</div>
}));

vi.mock('./components/PerformanceMonitoring/PerformanceMonitoring', () => ({
  PerformanceMonitoring: () => <div data-testid="performance-monitoring">Performance Monitoring Mock</div>
}));

describe('App', () => {
  it('should render the navigation menu', () => {
    render(<App />);
    expect(screen.getByText('AIDO System')).toBeInTheDocument();
    expect(screen.getByText('Agent Network')).toBeInTheDocument();
    expect(screen.getByText('Decision Making')).toBeInTheDocument();
    expect(screen.getByText('Consensus')).toBeInTheDocument();
    expect(screen.getByText('Task Allocation')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('should show AgentNetwork by default', () => {
    render(<App />);
    expect(screen.getByTestId('agent-network')).toBeInTheDocument();
  });

  it('should switch between views when navigation buttons are clicked', () => {
    render(<App />);
    
    // Click Task Allocation
    fireEvent.click(screen.getByText('Task Allocation'));
    expect(screen.getByTestId('task-allocation')).toBeInTheDocument();
    
    // Click Performance
    fireEvent.click(screen.getByText('Performance'));
    expect(screen.getByTestId('performance-monitoring')).toBeInTheDocument();
  });

  it('should handle proposal creation workflow', () => {
    render(<App />);
    
    // Create a proposal
    fireEvent.click(screen.getByText('Create Proposal'));
    
    // Switch to Decision Making view
    fireEvent.click(screen.getByText('Decision Making'));
    expect(screen.getByText('Decision Making Mock (Proposal: test-proposal-1)')).toBeInTheDocument();
    
    // Switch to Consensus view
    fireEvent.click(screen.getByText('Consensus'));
    expect(screen.getByText('Consensus Algorithm Mock (Proposal: test-proposal-1)')).toBeInTheDocument();
  });

  it('should highlight active navigation button', () => {
    render(<App />);
    
    const taskButton = screen.getByText('Task Allocation');
    fireEvent.click(taskButton);
    
    expect(taskButton.className).toContain('active');
    expect(screen.getByText('Agent Network')).not.toHaveClass('active');
  });

  it('should not show Decision Making and Consensus without a proposal', () => {
    render(<App />);
    
    fireEvent.click(screen.getByText('Decision Making'));
    expect(screen.queryByTestId('decision-making')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Consensus'));
    expect(screen.queryByTestId('consensus-algorithm')).not.toBeInTheDocument();
  });
});
