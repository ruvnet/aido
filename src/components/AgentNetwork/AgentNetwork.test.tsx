import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
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

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset our mocked implementations
    (OpenAIService as any).mockImplementation(() => mockOpenAI);
    (DatabaseService as any).mockImplementation(() => mockDatabase);
    
    // Setup default mock responses that resolve immediately
    mockDatabase.getAgents.mockResolvedValueOnce([
      { id: '1', name: 'Finance Agent', specialty: 'Finance' },
      { id: '2', name: 'Operations Agent', specialty: 'Operations' }
    ]);
  });

  it('should render agent network interface', async () => {
    render(<AgentNetwork openAIService={mockOpenAI} databaseService={mockDatabase} />);
    
    // Header should be visible immediately
    expect(screen.getByText('AI Agent Network')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading agents...')).not.toBeInTheDocument();
    });
    
    // Now check for elements that appear after loading
    expect(screen.getByText('Generate Proposal')).toBeInTheDocument();
    expect(screen.getByLabelText('Proposal Topic')).toBeInTheDocument();
    expect(screen.getByLabelText('Agent Specialty')).toBeInTheDocument();
  });

  it('should generate proposal when button is clicked', async () => {
    render(<AgentNetwork openAIService={mockOpenAI} databaseService={mockDatabase} />);
    
    // Wait for agents to load and button to be enabled
    await waitFor(() => {
      expect(screen.getByText('Generate Proposal')).toBeInTheDocument();
      expect(screen.getByLabelText('Proposal Topic')).toBeInTheDocument();
      expect(screen.getByLabelText('Agent Specialty')).toBeInTheDocument();
    });
    
    // Fill in proposal topic
    const topicInput = screen.getByLabelText('Proposal Topic');
    await act(async () => {
      fireEvent.change(topicInput, { target: { value: 'Cost Reduction' } });
    });
    
    // Select specialty
    const specialtySelect = screen.getByLabelText('Agent Specialty');
    await act(async () => {
      fireEvent.change(specialtySelect, { target: { value: 'Finance' } });
    });
    
    // Click generate button
    const generateButton = screen.getByText('Generate Proposal');
    await act(async () => {
      fireEvent.click(generateButton);
    });
    
    // Wait for async operations to complete
    await waitFor(() => {
      // Verify our dependencies were called correctly
      expect(mockOpenAI.generateProposal).toHaveBeenCalledWith(
        'Cost Reduction',
        'Finance'
      );
      expect(mockDatabase.saveProposal).toHaveBeenCalledWith(
        'Generated proposal content',
        'Finance'
      );
    });
    
    // Verify the result is displayed
    await waitFor(() => {
      expect(screen.getByText('Proposal generated successfully!')).toBeInTheDocument();
      expect(screen.getByText('Generated proposal content')).toBeInTheDocument();
    });
  });

  it('should display error when proposal generation fails', async () => {
    // Mock failure scenario
    mockOpenAI.generateProposal.mockRejectedValueOnce(new Error('API Error'));
    
    render(<AgentNetwork />);
    
    // Wait for initial load and button to be enabled
    await waitFor(() => {
      expect(screen.getByText('Generate Proposal')).toBeInTheDocument();
      expect(screen.getByLabelText('Proposal Topic')).toBeInTheDocument();
      expect(screen.getByLabelText('Agent Specialty')).toBeInTheDocument();
    });
    
    // Fill in form
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Proposal Topic'), { 
        target: { value: 'Cost Reduction' } 
      });
    });
    
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Agent Specialty'), { 
        target: { value: 'Finance' } 
      });
    });
    
    // Click and wait for error
    await act(async () => {
      fireEvent.click(screen.getByText('Generate Proposal'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Error generating proposal: API Error')).toBeInTheDocument();
    });
  });

  it('should load available agents on mount', async () => {
    await act(async () => {
      render(<AgentNetwork />);
    });
    
    // Verify our getAgents method was called
    expect(mockDatabase.getAgents).toHaveBeenCalled();
    
    // Verify agents are displayed in the specialty select
    const specialtySelect = screen.getByLabelText('Agent Specialty');
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Operations')).toBeInTheDocument();
  });

  it('should handle empty proposal topic', async () => {
    render(<AgentNetwork />);
    
    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByLabelText('Agent Specialty')).toBeInTheDocument();
    });
    
    const specialtySelect = screen.getByLabelText('Agent Specialty');
    fireEvent.change(specialtySelect, { target: { value: 'Finance' } });
    
    const generateButton = screen.getByText('Generate Proposal');
    await act(async () => {
      fireEvent.click(generateButton);
    });
    
    expect(await screen.findByText('Please enter a proposal topic')).toBeInTheDocument();
    expect(mockOpenAI.generateProposal).not.toHaveBeenCalled();
  });

  it('should handle empty specialty selection', async () => {
    render(<AgentNetwork />);
    
    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByLabelText('Agent Specialty')).toBeInTheDocument();
    });
    
    // Only fill in topic, leaving specialty empty
    const topicInput = screen.getByLabelText('Proposal Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    const generateButton = screen.getByText('Generate Proposal');
    await act(async () => {
      fireEvent.click(generateButton);
    });
    
    expect(await screen.findByText('Please select an agent specialty')).toBeInTheDocument();
    expect(mockOpenAI.generateProposal).not.toHaveBeenCalled();
  });
});
