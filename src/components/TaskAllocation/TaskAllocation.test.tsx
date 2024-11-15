import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskAllocation } from './TaskAllocation';
import { DatabaseService } from '../../services/DatabaseService';
import { OpenAIService } from '../../services/OpenAIService';

// Mock dependencies
vi.mock('../../services/DatabaseService');
vi.mock('../../services/OpenAIService');

describe('TaskAllocation', () => {
  const mockAgents = [
    { id: '1', name: 'Finance Agent', specialty: 'Finance' },
    { id: '2', name: 'Operations Agent', specialty: 'Operations' }
  ];

  const mockOpenAI = {
    matchTask: vi.fn().mockResolvedValue({
      agentId: '1',
      explanation: 'Best match for financial analysis'
    })
  };

  const mockDatabase = {
    getAgents: vi.fn().mockResolvedValue(mockAgents),
    saveTask: vi.fn().mockResolvedValue({
      id: '1',
      description: 'Financial analysis task',
      assignedAgentId: '1',
      status: 'assigned',
      createdAt: new Date()
    }),
    getAgentWorkload: vi.fn().mockResolvedValue({
      activeTaskCount: 2,
      completionRate: 0.9
    })
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (OpenAIService as any).mockImplementation(() => mockOpenAI);
    (DatabaseService as any).mockImplementation(() => mockDatabase);
  });

  it('should render task allocation interface', () => {
    render(<TaskAllocation />);
    expect(screen.getByText('Task Allocation')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Description')).toBeInTheDocument();
  });

  it('should load available agents on mount', async () => {
    render(<TaskAllocation />);
    
    expect(mockDatabase.getAgents).toHaveBeenCalled();
    
    await screen.findByText('Finance Agent');
    expect(screen.getByText('Operations Agent')).toBeInTheDocument();
  });

  it('should allocate task when form is submitted', async () => {
    render(<TaskAllocation />);
    
    // Fill in task description
    const taskInput = screen.getByLabelText('Task Description');
    fireEvent.change(taskInput, { 
      target: { value: 'Perform financial analysis for Q4' }
    });
    
    // Submit form
    const submitButton = screen.getByText('Allocate Task');
    fireEvent.click(submitButton);
    
    // Verify AI matching was called
    expect(mockOpenAI.matchTask).toHaveBeenCalledWith(
      'Perform financial analysis for Q4',
      expect.any(Array)
    );
    
    // Verify task was saved
    expect(mockDatabase.saveTask).toHaveBeenCalledWith(
      'Perform financial analysis for Q4',
      '1',
      'Best match for financial analysis'
    );
    
    // Verify success message
    await screen.findByText('Task allocated successfully');
    expect(screen.getByText('Assigned to: Finance Agent')).toBeInTheDocument();
  });

  it('should display agent workload information', async () => {
    render(<TaskAllocation />);
    
    await screen.findByText('Finance Agent');
    
    // Click on agent to view workload
    fireEvent.click(screen.getByText('Finance Agent'));
    
    // Verify workload info is displayed
    await screen.findByText('Active Tasks: 2');
    expect(screen.getByText('Completion Rate: 90%')).toBeInTheDocument();
  });

  it('should handle task allocation errors', async () => {
    // Mock failure scenario
    mockOpenAI.matchTask.mockRejectedValueOnce(new Error('Matching failed'));
    
    render(<TaskAllocation />);
    
    const taskInput = screen.getByLabelText('Task Description');
    fireEvent.change(taskInput, { 
      target: { value: 'Perform financial analysis' }
    });
    
    const submitButton = screen.getByText('Allocate Task');
    fireEvent.click(submitButton);
    
    await screen.findByText('Error allocating task: Matching failed');
  });

  it('should validate task description', async () => {
    render(<TaskAllocation />);
    
    const submitButton = screen.getByText('Allocate Task');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please enter a task description')).toBeInTheDocument();
    expect(mockOpenAI.matchTask).not.toHaveBeenCalled();
  });

  it('should disable submit button during allocation', async () => {
    render(<TaskAllocation />);
    
    const taskInput = screen.getByLabelText('Task Description');
    fireEvent.change(taskInput, { 
      target: { value: 'Perform financial analysis' }
    });
    
    const submitButton = screen.getByText('Allocate Task');
    fireEvent.click(submitButton);
    
    // Button should be disabled during allocation
    expect(submitButton).toBeDisabled();
    
    // Wait for allocation to complete
    await screen.findByText('Task allocated successfully');
    
    // Button should be enabled again
    expect(submitButton).not.toBeDisabled();
  });

  it('should show agent capabilities', async () => {
    render(<TaskAllocation />);
    
    await screen.findByText('Finance Agent');
    
    // Click on agent to view capabilities
    fireEvent.click(screen.getByText('Finance Agent'));
    
    // Verify capabilities are displayed
    expect(screen.getByText('Specialty: Finance')).toBeInTheDocument();
  });
});
