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
    generateProposal: vi.fn().mockImplementation(async (topic: string, specialty: string) => {
      return 'Generated proposal content';
    }),
  } as unknown as OpenAIService;

  const mockDatabase = {
    saveProposal: vi.fn().mockImplementation(async (content: string, specialty: string) => {
      return { id: '1', content: content };
    }),
    getAgents: vi.fn().mockResolvedValue([
      { id: '1', name: 'Finance Agent', specialty: 'Finance' },
      { id: '2', name: 'Operations Agent', specialty: 'Operations' },
    ]),
  } as unknown as DatabaseService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset our mocked implementations
    mockOpenAI.generateProposal.mockReset();
    mockDatabase.getAgents.mockReset();
    mockDatabase.saveProposal.mockReset();
    
    // Setup default mock responses
    mockDatabase.getAgents.mockResolvedValue([
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
    
    // Click generate button and wait for async operations
    const generateButton = screen.getByText('Generate Proposal');
    // Setup mock implementations
    mockOpenAI.generateProposal.mockResolvedValueOnce('Generated proposal content');
    mockDatabase.saveProposal.mockResolvedValueOnce({ 
      id: '1', 
      content: 'Generated proposal content' 
    });

    await act(async () => {
      fireEvent.click(generateButton);
    });

    // Wait for all async operations to complete
    await waitFor(() => {
      expect(mockOpenAI.generateProposal).toHaveBeenCalledWith(
        'Cost Reduction',
        'Finance'
      );
    }, { timeout: 3000 });

    expect(mockDatabase.saveProposal).toHaveBeenCalledWith(
      'Generated proposal content',
      'Finance'
    );
    
    // Verify the result is displayed
    await waitFor(() => {
      expect(screen.getByText('Proposal generated successfully!')).toBeInTheDocument();
      expect(screen.getByText('Generated proposal content')).toBeInTheDocument();
    });
  });

  it('should display error when proposal generation fails', async () => {
    // Mock failure scenario
    mockOpenAI.generateProposal.mockRejectedValueOnce(new Error('API Error'));
    
    render(<AgentNetwork openAIService={mockOpenAI} databaseService={mockDatabase} />);
    
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
    render(<AgentNetwork openAIService={mockOpenAI} databaseService={mockDatabase} />);
    
    await waitFor(() => {
      expect(mockDatabase.getAgents).toHaveBeenCalled();
    });
    
    // Verify our getAgents method was called
    expect(mockDatabase.getAgents).toHaveBeenCalled();
    
    // Verify agents are displayed in the specialty select
    const specialtySelect = screen.getByLabelText('Agent Specialty');
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Operations')).toBeInTheDocument();
  });

  it('should handle empty proposal topic', async () => {
    render(<AgentNetwork openAIService={mockOpenAI} databaseService={mockDatabase} />);
    
    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByLabelText('Agent Specialty')).toBeInTheDocument();
    });
    
    const specialtySelect = screen.getByLabelText('Agent Specialty');
    await act(async () => {
      fireEvent.change(specialtySelect, { target: { value: 'Finance' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Generate Proposal'));
    });
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeVisible();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a proposal topic');
    }, { timeout: 1000 });
    
    expect(mockOpenAI.generateProposal).not.toHaveBeenCalled();
  });

  it('should handle empty specialty selection', async () => {
    render(<AgentNetwork openAIService={mockOpenAI} databaseService={mockDatabase} />);
    
    await waitFor(() => {
      expect(mockDatabase.getAgents).toHaveBeenCalled();
      expect(screen.getByLabelText('Agent Specialty')).toBeInTheDocument();
    });
    
    // Only fill in topic, leaving specialty empty
    const topicInput = screen.getByLabelText('Proposal Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Generate Proposal'));
    });
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeVisible();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please select an agent specialty');
    }, { timeout: 1000 });
    
    expect(mockOpenAI.generateProposal).not.toHaveBeenCalled();
  });
});
