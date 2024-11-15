import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PerformanceMonitoring } from './PerformanceMonitoring';
import { DatabaseService } from '../../services/DatabaseService';

// Mock dependencies
vi.mock('../../services/DatabaseService');

describe('PerformanceMonitoring', () => {
  const mockMetrics = {
    proposals: {
      total: 50,
      accepted: 35,
      rejected: 15,
      averageEvaluationTime: 3600 // 1 hour in seconds
    },
    tasks: {
      total: 100,
      completed: 80,
      inProgress: 15,
      pending: 5,
      averageCompletionTime: 86400 // 24 hours in seconds
    },
    agents: [
      {
        id: '1',
        name: 'Finance Agent',
        completedTasks: 30,
        acceptedProposals: 15,
        averageRating: 4.5
      },
      {
        id: '2',
        name: 'Operations Agent',
        completedTasks: 50,
        acceptedProposals: 20,
        averageRating: 4.8
      }
    ]
  };

  const mockDatabase = {
    getPerformanceMetrics: vi.fn().mockResolvedValue(mockMetrics)
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (DatabaseService as any).mockImplementation(() => mockDatabase);
  });

  it('should render performance monitoring interface', async () => {
    await act(async () => {
      render(<PerformanceMonitoring />);
    });
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument();
  });

  it('should load and display performance metrics', async () => {
    render(<PerformanceMonitoring />);
    
    // Verify database call
    expect(mockDatabase.getPerformanceMetrics).toHaveBeenCalled();
    
    // Verify proposal metrics
    await screen.findByText('Proposal Success Rate: 70%');
    expect(screen.getByText('Total Proposals: 50')).toBeInTheDocument();
    
    // Verify task metrics
    expect(screen.getByText('Task Completion Rate: 80%')).toBeInTheDocument();
    expect(screen.getByText('Average Completion Time: 24 hours')).toBeInTheDocument();
  });

  it('should display agent performance rankings', async () => {
    render(<PerformanceMonitoring />);
    
    await screen.findByText('Agent Performance Rankings');
    
    // Switch to agent view and verify metrics
    const agentViewButton = screen.getByText('Agent Performance Rankings');
    fireEvent.click(agentViewButton);

    // Verify agent metrics are displayed
    expect(screen.getByText('Operations Agent')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks: 50')).toBeInTheDocument();
    expect(screen.getByText('Rating: 4.8')).toBeInTheDocument();
  });

  it('should allow filtering by date range', async () => {
    await act(async () => {
      render(<PerformanceMonitoring />);
    });
    
    // Select date range
    const startDate = screen.getByLabelText('Start Date');
    const endDate = screen.getByLabelText('End Date');
    
    await act(async () => {
      fireEvent.change(startDate, { target: { value: '2024-01-01' } });
      fireEvent.change(endDate, { target: { value: '2024-01-31' } });
    });
    
    await act(async () => {
      const applyButton = screen.getByText('Apply Filter');
      fireEvent.click(applyButton);
    });
    
    // Verify database call with date range
    expect(mockDatabase.getPerformanceMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      })
    );
  });

  it('should handle metrics loading error', async () => {
    // Mock error scenario
    mockDatabase.getPerformanceMetrics.mockRejectedValueOnce(new Error('Failed to load metrics'));
    
    render(<PerformanceMonitoring />);
    
    await screen.findByText('Error loading performance metrics: Failed to load metrics');
  });

  it('should display performance trends', async () => {
    render(<PerformanceMonitoring />);
    
    const proposalTrend = await screen.findByText('Proposal Success Trend: Improving');
    const taskTrend = await screen.findByText('Task Completion Trend: Stable');
    
    expect(proposalTrend).toBeInTheDocument();
    expect(taskTrend).toBeInTheDocument();
    
    // Verify trend metrics
    expect(screen.getByText('Proposal Success Trend: Improving')).toBeInTheDocument();
    expect(screen.getByText('Task Completion Trend: Stable')).toBeInTheDocument();
  });

  it('should allow switching between different metric views', async () => {
    render(<PerformanceMonitoring />);
    
    // Switch to agent view
    const agentViewButton = screen.getByText('Agent Performance Rankings');
    fireEvent.click(agentViewButton);
    
    await screen.findByText('Agent Performance Rankings');
    
    // Switch to task view
    const taskViewButton = screen.getByText('Task Metrics');
    fireEvent.click(taskViewButton);
    
    await screen.findByText('Task Statistics');
  });

  it('should calculate and display efficiency scores', async () => {
    render(<PerformanceMonitoring />);
    
    await screen.findByText('System Efficiency Score');
    
    // Verify efficiency calculations
    expect(screen.getByText('Overall Efficiency: 85%')).toBeInTheDocument();
    expect(screen.getByText('Resource Utilization: High')).toBeInTheDocument();
  });
});
