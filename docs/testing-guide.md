# AIDO Testing Guide

This guide provides detailed examples of testing each component and function in the AIDO system using the London School TDD approach.

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Component Testing Examples

### 1. Agent Network Testing

```typescript
// Test proposal generation
describe('AgentNetwork - Proposal Generation', () => {
  it('should generate a proposal successfully', async () => {
    const mockOpenAI = {
      generateProposal: vi.fn().mockResolvedValue('Generated proposal content')
    };
    
    render(<AgentNetwork />);
    
    // Fill in proposal details
    await userEvent.type(screen.getByLabelText('Proposal Topic'), 'Cost Reduction');
    await userEvent.selectOptions(screen.getByLabelText('Agent Specialty'), 'Finance');
    
    // Generate proposal
    await userEvent.click(screen.getByText('Generate Proposal'));
    
    // Verify OpenAI was called correctly
    expect(mockOpenAI.generateProposal).toHaveBeenCalledWith(
      'Cost Reduction',
      'Finance'
    );
    
    // Verify UI updates
    expect(await screen.findByText('Generated proposal content')).toBeInTheDocument();
  });

  // Test error handling
  it('should handle proposal generation errors', async () => {
    const mockOpenAI = {
      generateProposal: vi.fn().mockRejectedValue(new Error('API Error'))
    };
    
    render(<AgentNetwork />);
    
    // Attempt to generate proposal
    await userEvent.click(screen.getByText('Generate Proposal'));
    
    // Verify error handling
    expect(await screen.findByText('Error generating proposal: API Error')).toBeInTheDocument();
  });
});
```

### 2. Decision Making Testing

```typescript
describe('DecisionMaking - Proposal Evaluation', () => {
  it('should evaluate a proposal successfully', async () => {
    const mockEvaluation = {
      score: 8,
      explanation: 'Strong proposal with clear objectives'
    };
    
    const mockOpenAI = {
      evaluateProposal: vi.fn().mockResolvedValue(mockEvaluation)
    };
    
    render(<DecisionMaking proposalId="test-1" />);
    
    // Wait for proposal to load
    await screen.findByText('Test Proposal Content');
    
    // Trigger evaluation
    await userEvent.click(screen.getByText('Evaluate Proposal'));
    
    // Verify evaluation results
    expect(await screen.findByText('Score: 8')).toBeInTheDocument();
    expect(screen.getByText(mockEvaluation.explanation)).toBeInTheDocument();
  });

  // Test multiple evaluations
  it('should handle multiple evaluations', async () => {
    const evaluations = [
      { score: 8, explanation: 'Good proposal' },
      { score: 7, explanation: 'Viable solution' }
    ];
    
    render(<DecisionMaking proposalId="test-1" />);
    
    // Add multiple evaluations
    for (const eval of evaluations) {
      await userEvent.click(screen.getByText('Add Evaluation'));
      // Fill in evaluation
      await userEvent.type(screen.getByLabelText('Score'), eval.score.toString());
      await userEvent.type(screen.getByLabelText('Explanation'), eval.explanation);
      await userEvent.click(screen.getByText('Submit Evaluation'));
    }
    
    // Verify all evaluations are displayed
    expect(screen.getAllByTestId('evaluation-item')).toHaveLength(2);
  });
});
```

### 3. Consensus Algorithm Testing

```typescript
describe('ConsensusAlgorithm - Consensus Calculation', () => {
  it('should reach consensus when threshold is met', async () => {
    const mockEvaluations = [
      { score: 8, weight: 1 },
      { score: 7, weight: 1 },
      { score: 9, weight: 1 }
    ];
    
    render(<ConsensusAlgorithm proposalId="test-1" />);
    
    // Wait for evaluations to load
    await screen.findByText('Total Evaluations: 3');
    
    // Calculate consensus
    await userEvent.click(screen.getByText('Calculate Consensus'));
    
    // Verify consensus result
    expect(await screen.findByText('Consensus Reached: Accepted')).toBeInTheDocument();
    expect(screen.getByText('Average Score: 8.0')).toBeInTheDocument();
  });

  // Test consensus strength calculation
  it('should calculate consensus strength correctly', async () => {
    render(<ConsensusAlgorithm proposalId="test-1" />);
    
    await screen.findByText('Consensus Metrics');
    
    // Verify consensus metrics
    expect(screen.getByText('Consensus Strength: High')).toBeInTheDocument();
    expect(screen.getByText('Score Variance: Low')).toBeInTheDocument();
    expect(screen.getByText('Participation Rate: 100%')).toBeInTheDocument();
  });
});
```

### 4. Task Allocation Testing

```typescript
describe('TaskAllocation - Task Distribution', () => {
  it('should allocate task to best matching agent', async () => {
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
    
    render(<TaskAllocation />);
    
    // Create new task
    await userEvent.type(
      screen.getByLabelText('Task Description'),
      'Perform financial analysis'
    );
    
    await userEvent.click(screen.getByText('Allocate Task'));
    
    // Verify allocation
    expect(mockOpenAI.matchTask).toHaveBeenCalled();
    expect(await screen.findByText('Task allocated successfully')).toBeInTheDocument();
    expect(screen.getByText('Assigned to: Finance Agent')).toBeInTheDocument();
  });

  // Test workload balancing
  it('should consider agent workload in allocation', async () => {
    render(<TaskAllocation />);
    
    // View agent workload
    await userEvent.click(screen.getByText('Finance Agent'));
    
    // Verify workload info
    expect(screen.getByText('Active Tasks: 2')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate: 90%')).toBeInTheDocument();
  });
});
```

### 5. Performance Monitoring Testing

```typescript
describe('PerformanceMonitoring - Metrics Tracking', () => {
  it('should display system performance metrics', async () => {
    const mockMetrics = {
      proposals: {
        total: 50,
        accepted: 35,
        rejected: 15,
        averageEvaluationTime: 3600
      },
      tasks: {
        total: 100,
        completed: 80,
        inProgress: 15,
        pending: 5
      }
    };
    
    render(<PerformanceMonitoring />);
    
    // Verify metrics display
    expect(await screen.findByText('Proposal Success Rate: 70%')).toBeInTheDocument();
    expect(screen.getByText('Task Completion Rate: 80%')).toBeInTheDocument();
  });

  // Test date range filtering
  it('should filter metrics by date range', async () => {
    render(<PerformanceMonitoring />);
    
    // Set date range
    await userEvent.type(
      screen.getByLabelText('Start Date'),
      '2024-01-01'
    );
    await userEvent.type(
      screen.getByLabelText('End Date'),
      '2024-01-31'
    );
    
    await userEvent.click(screen.getByText('Apply Filter'));
    
    // Verify filtered metrics
    expect(await screen.findByText('Metrics for January 2024')).toBeInTheDocument();
  });
});
```

## Service Testing Examples

### 1. OpenAI Service Testing

```typescript
describe('OpenAIService', () => {
  it('should generate proposal content', async () => {
    const openAI = new OpenAIService('test-key');
    const result = await openAI.generateProposal(
      'Cost Reduction',
      'Finance'
    );
    
    expect(result).toContain('Cost Reduction');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should evaluate proposal content', async () => {
    const openAI = new OpenAIService('test-key');
    const result = await openAI.evaluateProposal(
      'Test proposal content'
    );
    
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
    expect(result.explanation).toBeTruthy();
  });
});
```

### 2. Database Service Testing

```typescript
describe('DatabaseService', () => {
  it('should save and retrieve proposals', async () => {
    const db = new DatabaseService();
    
    // Save proposal
    const savedProposal = await db.saveProposal(
      'Test content',
      'Finance'
    );
    
    // Retrieve proposal
    const retrieved = await db.getProposal(savedProposal.id);
    
    expect(retrieved).toEqual(savedProposal);
  });

  it('should track agent workload', async () => {
    const db = new DatabaseService();
    const workload = await db.getAgentWorkload('agent-1');
    
    expect(workload.activeTaskCount).toBeGreaterThanOrEqual(0);
    expect(workload.completionRate).toBeGreaterThanOrEqual(0);
    expect(workload.completionRate).toBeLessThanOrEqual(1);
  });
});
```

## Integration Testing Examples

```typescript
describe('AIDO System Integration', () => {
  it('should complete full proposal workflow', async () => {
    render(<App />);
    
    // 1. Generate proposal
    await userEvent.type(
      screen.getByLabelText('Proposal Topic'),
      'Cost Reduction Strategy'
    );
    await userEvent.selectOptions(
      screen.getByLabelText('Agent Specialty'),
      'Finance'
    );
    await userEvent.click(screen.getByText('Generate Proposal'));
    
    // 2. Evaluate proposal
    await userEvent.click(screen.getByText('Decision Making'));
    await userEvent.click(screen.getByText('Evaluate Proposal'));
    
    // 3. Reach consensus
    await userEvent.click(screen.getByText('Consensus'));
    await userEvent.click(screen.getByText('Calculate Consensus'));
    
    // 4. Verify final state
    expect(await screen.findByText('Consensus Reached: Accepted')).toBeInTheDocument();
  });
});
```

## Test Coverage Requirements

Ensure the following coverage metrics are met:
- Line coverage: > 90%
- Branch coverage: > 85%
- Function coverage: > 90%
- Statement coverage: > 90%

## Running Tests with Coverage

```bash
# Generate coverage report
npm run test:coverage

# View detailed coverage report
open coverage/index.html
```

## Continuous Integration Testing

The GitHub Actions workflow automatically runs tests on every push:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Test Debugging

To debug tests:
1. Use the `test:ui` command to run tests with UI
2. Set breakpoints in your test files
3. Use console.log for debugging output
4. Check test context and component state

Example debug configuration:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
