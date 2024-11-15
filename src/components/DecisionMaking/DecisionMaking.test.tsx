import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DecisionMaking } from './DecisionMaking';
import { OpenAIService } from '../../services/OpenAIService';
import { DatabaseService } from '../../services/DatabaseService';

// Mock dependencies
vi.mock('../../services/OpenAIService');
vi.mock('../../services/DatabaseService');

describe('DecisionMaking', () => {
  const mockProposal = {
    id: '1',
    content: 'Test proposal content',
    agentSpecialty: 'Finance',
    status: 'pending' as const,
    createdAt: new Date()
  };

  const mockOpenAI = {
    evaluateProposal: vi.fn().mockResolvedValue({
      score: 8,
      explanation: 'Good proposal with clear objectives'
    })
  };

  const mockDatabase = {
    getProposal: vi.fn().mockResolvedValue(mockProposal),
    saveEvaluation: vi.fn().mockResolvedValue({
      id: '1',
      proposalId: '1',
      score: 8,
      explanation: 'Good proposal with clear objectives'
    })
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (OpenAIService as any).mockImplementation(() => mockOpenAI);
    (DatabaseService as any).mockImplementation(() => mockDatabase);
  });

  it('should render decision making interface', async () => {
    await act(async () => {
      render(<DecisionMaking proposalId="1" />);
    });
    expect(screen.getByText('Proposal Evaluation')).toBeInTheDocument();
  });

  it('should load and display proposal content', async () => {
    render(<DecisionMaking proposalId="1" />);
    
    // Verify database call
    expect(mockDatabase.getProposal).toHaveBeenCalledWith('1');
    
    // Wait for proposal content to be displayed
    await screen.findByText('Test proposal content');
  });

  it('should evaluate proposal when evaluate button is clicked', async () => {
    await act(async () => {
      render(<DecisionMaking proposalId="1" />);
    });
    
    // Wait for proposal to load
    await screen.findByText('Test proposal content');
    
    // Click evaluate button
    await act(async () => {
      const evaluateButton = screen.getByText('Evaluate Proposal');
      fireEvent.click(evaluateButton);
    });
    
    // Wait for async operations to complete
    await act(async () => {
      await Promise.resolve(); // Flush promises
    });
    
    // Verify OpenAI service was called
    expect(mockOpenAI.evaluateProposal).toHaveBeenCalledWith(mockProposal.content);
    
    // Verify evaluation was saved
    expect(mockDatabase.saveEvaluation).toHaveBeenCalledWith(
      '1',
      8,
      'Good proposal with clear objectives'
    );
    
    // Verify evaluation results are displayed
    await screen.findByText('Score: 8');
    expect(screen.getByText('Good proposal with clear objectives')).toBeInTheDocument();
  });

  it('should handle evaluation errors', async () => {
    // Mock failure scenario
    mockOpenAI.evaluateProposal.mockRejectedValueOnce(new Error('Evaluation failed'));
    
    render(<DecisionMaking proposalId="1" />);
    
    await screen.findByText('Test proposal content');
    
    const evaluateButton = screen.getByText('Evaluate Proposal');
    fireEvent.click(evaluateButton);
    
    // Verify error message is displayed
    await screen.findByText('Error evaluating proposal: Evaluation failed');
  });

  it('should handle missing proposal', async () => {
    // Mock missing proposal
    mockDatabase.getProposal.mockResolvedValueOnce(null);
    
    render(<DecisionMaking proposalId="1" />);
    
    // Verify error message
    await screen.findByText('Proposal not found');
  });

  it('should disable evaluate button while evaluation is in progress', async () => {
    render(<DecisionMaking proposalId="1" />);
    
    await screen.findByText('Test proposal content');
    
    const evaluateButton = screen.getByText('Evaluate Proposal');
    fireEvent.click(evaluateButton);
    
    // Button should be disabled during evaluation
    expect(evaluateButton).toBeDisabled();
    
    // Wait for evaluation to complete
    await screen.findByText('Score: 8');
    
    // Button should be enabled again
    expect(evaluateButton).not.toBeDisabled();
  });
});
