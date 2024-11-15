import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConsensusAlgorithm } from './ConsensusAlgorithm';
import { DatabaseService } from '../../services/DatabaseService';

// Mock dependencies
vi.mock('../../services/DatabaseService');

describe('ConsensusAlgorithm', () => {
  const mockEvaluations = [
    { id: '1', proposalId: '1', score: 8, explanation: 'Good idea', createdAt: new Date() },
    { id: '2', proposalId: '1', score: 7, explanation: 'Viable', createdAt: new Date() },
    { id: '3', proposalId: '1', score: 9, explanation: 'Excellent', createdAt: new Date() }
  ];

  const mockProposal = {
    id: '1',
    content: 'Test proposal',
    agentSpecialty: 'Finance',
    status: 'pending' as const,
    createdAt: new Date()
  };

  const mockDatabase = {
    getProposal: vi.fn().mockResolvedValue(mockProposal),
    getEvaluations: vi.fn().mockResolvedValue(mockEvaluations),
    updateProposalStatus: vi.fn().mockResolvedValue({ ...mockProposal, status: 'accepted' })
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (DatabaseService as any).mockImplementation(() => mockDatabase);
  });

  it('should render consensus algorithm interface', async () => {
    await act(async () => {
      render(<ConsensusAlgorithm proposalId="1" />);
    });
    expect(screen.getByText('Consensus Algorithm')).toBeInTheDocument();
  });

  it('should load proposal and evaluations on mount', async () => {
    await act(async () => {
      render(<ConsensusAlgorithm proposalId="1" />);
    });
    
    expect(mockDatabase.getProposal).toHaveBeenCalledWith('1');
    expect(mockDatabase.getEvaluations).toHaveBeenCalledWith('1');
    
    // Wait for content to load
    await screen.findByText('Test proposal');
    await screen.findByText('Total Evaluations: 3');
  });

  it('should calculate and display consensus metrics', async () => {
    await act(async () => {
      render(<ConsensusAlgorithm proposalId="1" />);
    });
    
    // Wait for calculations to complete
    await screen.findByText('Average Score: 8.0');
    expect(screen.getByText('Consensus Strength: High')).toBeInTheDocument();
  });

  it('should reach consensus when calculate button is clicked', async () => {
    await act(async () => {
      render(<ConsensusAlgorithm proposalId="1" />);
    });
    
    const calculateButton = await screen.findByText('Calculate Consensus');
    await act(async () => {
      fireEvent.click(calculateButton);
    });
    
    // Verify database update
    expect(mockDatabase.updateProposalStatus).toHaveBeenCalledWith('1', 'accepted');
    
    // Verify UI updates
    await screen.findByText('Consensus Reached: Accepted');
  });

  it('should handle insufficient evaluations', async () => {
    // Mock scenario with insufficient evaluations
    mockDatabase.getEvaluations.mockResolvedValueOnce([]);
    
    await act(async () => {
      render(<ConsensusAlgorithm proposalId="1" />);
    });
    
    await screen.findByText('Insufficient evaluations to reach consensus');
    expect(screen.queryByText('Calculate Consensus')).not.toBeInTheDocument();
  });

  it('should display error when consensus calculation fails', async () => {
    // Mock failure scenario
    mockDatabase.updateProposalStatus.mockRejectedValueOnce(new Error('Database error'));
    
    await act(async () => {
      render(<ConsensusAlgorithm proposalId="1" />);
    });
    
    const calculateButton = await screen.findByText('Calculate Consensus');
    await act(async () => {
      fireEvent.click(calculateButton);
    });
    
    await screen.findByText('Error reaching consensus: Database error');
  });

  it('should calculate consensus strength correctly', async () => {
    await act(async () => {
      render(<ConsensusAlgorithm proposalId="1" />);
    });
    
    // Wait for calculations
    await screen.findByText('Consensus Strength: High');
    
    // Verify consensus metrics
    expect(screen.getByText('Score Variance: Low')).toBeInTheDocument();
    expect(screen.getByText('Participation Rate: 100%')).toBeInTheDocument();
  });

  it('should disable calculate button during processing', async () => {
    await act(async () => {
      render(<ConsensusAlgorithm proposalId="1" />);
    });
    
    const calculateButton = await screen.findByText('Calculate Consensus');
    await act(async () => {
      fireEvent.click(calculateButton);
    });
    
    // Button should be disabled during processing
    expect(calculateButton).toBeDisabled();
    
    // Wait for processing to complete
    await screen.findByText('Consensus Reached: Accepted');
    
    // Button should remain disabled after consensus is reached
    expect(calculateButton).toBeDisabled();
  });
});
