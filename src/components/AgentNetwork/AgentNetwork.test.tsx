import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AgentNetwork } from './AgentNetwork';
import { OpenAIService } from '../../services/OpenAIService';
import { DatabaseService } from '../../services/DatabaseService';

// Mock our dependencies following London School TDD
vi.mock('../../services/OpenAIService');
vi.mock('../../services/DatabaseService');

describe('AgentNetwork', () => {
  // Setup our mocked dependencies
  const mockOpenAI = {
    generateProposal: vi.fn().mockResolvedValue('Generated proposal content'),
  };

  const mockDatabase = {
    saveProposal: vi.fn().mockResolvedValue({ id: '1', content: 'Generated proposal content' }),
    getAgents: vi.fn().mockResolvedValue([
      { id: '1', name: 'Finance Agent', specialty: 'Finance' },
      { id: '2', name: 'Operations Agent', specialty: 'Operations' },
    ]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset our mocked implementations
    (OpenAIService as any).mockImplementation(() => mockOpenAI);
    (DatabaseService as any).mockImplementation(() => mockDatabase);
  });

  it('should render agent network interface', () => {
    render(<AgentNetwork />);
    expect(screen.getByText('AI Agent Network')).toBeInTheDocument();
    expect(screen.getByText('Generate Proposal')).toBeInTheDocument();
  });

  it('should generate proposal when button is clicked', async () => {
    render(<AgentNetwork />);
    
    // Fill in proposal topic
    const topicInput = screen.getByLabelText('Proposal Topic');
    fireEvent.change(topicInput, { target: { value: 'Cost Reduction' } });
    
    // Wait for agents to load and select specialty
    await screen.findByText('Finance');
    const specialtySelect = screen.getByLabelText('Agent Specialty');
    fireEvent.change(specialtySelect, { target: { value: 'Finance' } });
    
    // Click generate button
    await act(async () => {
      const generateButton = screen.getByText('Generate Proposal');
      fireEvent.click(generateButton);
    });
    
    // Verify our dependencies were called correctly
    expect(mockOpenAI.generateProposal).toHaveBeenCalledWith(
      'Cost Reduction',
      'Finance'
    );
    expect(mockDatabase.saveProposal).toHaveBeenCalledWith(
      'Generated proposal content',
      'Finance'
    );
    
    // Verify the result is displayed
    await screen.findByText('Proposal generated successfully!');
    expect(screen.getByText('Generated proposal content')).toBeInTheDocument();
  });

  it('should display error when proposal generation fails', async () => {
    // Mock failure scenario
    mockOpenAI.generateProposal.mockRejectedValueOnce(new Error('API Error'));
    
    render(<AgentNetwork />);
    
    const topicInput = screen.getByLabelText('Proposal Topic');
    fireEvent.change(topicInput, { target: { value: 'Cost Reduction' } });
    
    const specialtySelect = screen.getByLabelText('Agent Specialty');
    fireEvent.change(specialtySelect, { target: { value: 'Finance' } });
    
    const generateButton = screen.getByText('Generate Proposal');
    fireEvent.click(generateButton);
    
    await screen.findByText('Error generating proposal: API Error');
  });

  it('should load available agents on mount', async () => {
    render(<AgentNetwork />);
    
    // Verify our getAgents method was called
    expect(mockDatabase.getAgents).toHaveBeenCalled();
    
    // Verify agents are displayed in the specialty select
    const specialtySelect = screen.getByLabelText('Agent Specialty');
    await screen.findByText('Finance');
    await screen.findByText('Operations');
  });

  it('should handle empty proposal topic', async () => {
    await act(async () => {
      render(<AgentNetwork />);
    });
    
    await act(async () => {
      const specialtySelect = screen.getByLabelText('Agent Specialty');
      fireEvent.change(specialtySelect, { target: { value: 'Finance' } });
      
      const generateButton = screen.getByText('Generate Proposal');
      fireEvent.click(generateButton);
    });
    
    expect(screen.getByText('Please enter a proposal topic')).toBeInTheDocument();
    expect(mockOpenAI.generateProposal).not.toHaveBeenCalled();
  });
});
