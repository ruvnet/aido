# AIDO Development Guide

This guide provides detailed instructions for developing and running the AIDO (AI-Driven Decentralized Organization) system.

## Project Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd aido/src
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the src directory:
```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_DATABASE_URL=your_database_url
```

## Development Server

1. **Start Development Server**
```bash
npm run dev
```
This will start the Vite development server at `http://localhost:5173`

2. **Build for Production**
```bash
npm run build
```

3. **Preview Production Build**
```bash
npm run preview
```

## Component Development

### 1. Agent Network Component

The Agent Network component manages AI agents and proposal generation.

```typescript
// Example usage
import { AgentNetwork } from './components/AgentNetwork/AgentNetwork';

// With proposal creation callback
<AgentNetwork onProposalCreated={(proposalId) => {
  console.log(`New proposal created: ${proposalId}`);
}} />
```

Key features:
- Proposal generation
- Agent specialty selection
- Real-time feedback
- Error handling

### 2. Decision Making Component

The Decision Making component handles proposal evaluation.

```typescript
// Example usage
import { DecisionMaking } from './components/DecisionMaking/DecisionMaking';

// With specific proposal
<DecisionMaking proposalId="proposal-123" />
```

Key features:
- Proposal evaluation
- Score calculation
- Evaluation history
- Multiple evaluator support

### 3. Consensus Algorithm Component

The Consensus Algorithm component manages agreement on proposals.

```typescript
// Example usage
import { ConsensusAlgorithm } from './components/ConsensusAlgorithm/ConsensusAlgorithm';

// With specific proposal
<ConsensusAlgorithm proposalId="proposal-123" />
```

Key features:
- Consensus calculation
- Voting mechanism
- Threshold management
- Real-time updates

### 4. Task Allocation Component

The Task Allocation component handles task distribution among agents.

```typescript
// Example usage
import { TaskAllocation } from './components/TaskAllocation/TaskAllocation';

<TaskAllocation />
```

Key features:
- Task creation
- Agent matching
- Workload balancing
- Performance tracking

### 5. Performance Monitoring Component

The Performance Monitoring component tracks system metrics.

```typescript
// Example usage
import { PerformanceMonitoring } from './components/PerformanceMonitoring/PerformanceMonitoring';

<PerformanceMonitoring />
```

Key features:
- Real-time metrics
- Historical data
- Performance analysis
- Custom date ranges

## Service Development

### 1. OpenAI Service

The OpenAI service manages AI operations.

```typescript
// Example usage
import { OpenAIService } from './services/OpenAIService';

const openAI = new OpenAIService('your-api-key');

// Generate proposal
const proposal = await openAI.generateProposal('Cost Reduction', 'Finance');

// Evaluate proposal
const evaluation = await openAI.evaluateProposal('Proposal content');
```

### 2. Database Service

The Database service manages data persistence.

```typescript
// Example usage
import { DatabaseService } from './services/DatabaseService';

const db = new DatabaseService();

// Save proposal
const proposal = await db.saveProposal('content', 'specialty');

// Get agent workload
const workload = await db.getAgentWorkload('agent-id');
```

## State Management

The application uses React's built-in state management with hooks:

```typescript
// Local state
const [state, setState] = useState(initialState);

// Effect hooks
useEffect(() => {
  // Side effects
}, [dependencies]);
```

## Error Handling

Implement error handling using try-catch blocks:

```typescript
try {
  const result = await someAsyncOperation();
} catch (err) {
  setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
}
```

## Styling

The application uses CSS modules for styling:

```css
/* Component specific styles */
.componentName {
  /* styles */
}

/* Responsive design */
@media (max-width: 768px) {
  .componentName {
    /* mobile styles */
  }
}
```

## Code Quality

1. **Linting**
```bash
npm run lint
```

2. **Type Checking**
```bash
npm run type-check
```

3. **Format Code**
```bash
npm run format
```

## Debugging

1. **Browser DevTools**
- Use React DevTools for component inspection
- Use Network tab for API calls
- Use Console for logging

2. **VS Code Debugging**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## Performance Optimization

1. **Code Splitting**
```typescript
const Component = React.lazy(() => import('./Component'));
```

2. **Memoization**
```typescript
const MemoizedComponent = React.memo(Component);
```

3. **UseCallback for Functions**
```typescript
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

## Deployment

1. **Build Application**
```bash
npm run build
```

2. **Preview Build**
```bash
npm run preview
```

3. **Deploy to Production**
```bash
# Example deployment to Vercel
vercel --prod
```

## Monitoring

1. **Performance Monitoring**
- Use Performance tab in DevTools
- Monitor component render times
- Track API response times

2. **Error Tracking**
- Implement error boundaries
- Log errors to monitoring service
- Track user interactions

## Best Practices

1. **Component Structure**
- Keep components focused and small
- Use TypeScript interfaces
- Implement proper prop validation

2. **Code Organization**
- Group related files together
- Use consistent naming conventions
- Maintain clear file structure

3. **Testing**
- Write tests for new features
- Maintain high coverage
- Use meaningful test descriptions

4. **Documentation**
- Document complex logic
- Update README for new features
- Include JSDoc comments

## Troubleshooting

Common issues and solutions:

1. **Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

2. **Type Errors**
```bash
# Regenerate TypeScript types
npm run type-check
```

3. **Development Server Issues**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

Follow the [Testing Guide](./testing-guide.md) for test requirements.
