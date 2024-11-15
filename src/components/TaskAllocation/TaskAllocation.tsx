import React, { useState, useEffect } from 'react';
import { OpenAIService } from '../../services/OpenAIService';
import { DatabaseService, Agent, AgentWorkload } from '../../services/DatabaseService';

export const TaskAllocation: React.FC = () => {
  const [taskDescription, setTaskDescription] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [workload, setWorkload] = useState<AgentWorkload | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAllocating, setIsAllocating] = useState(false);

  const openAI = new OpenAIService('dummy-key');
  const database = new DatabaseService();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const loadedAgents = await database.getAgents();
      setAgents(loadedAgents);
    } catch (err) {
      setError('Error loading agents');
    }
  };

  const handleAgentClick = async (agent: Agent) => {
    setSelectedAgent(agent);
    try {
      const agentWorkload = await database.getAgentWorkload(agent.id);
      setWorkload(agentWorkload);
    } catch (err) {
      setError('Error loading agent workload');
    }
  };

  const handleSubmit = async () => {
    // Reset states
    setError('');
    setSuccess('');

    // Validate input
    if (!taskDescription.trim()) {
      setError('Please enter a task description');
      return;
    }

    setIsAllocating(true);

    try {
      // Match task to best agent using AI
      const match = await openAI.matchTask(
        taskDescription,
        agents.map(a => ({ id: a.id, specialty: a.specialty }))
      );

      // Save task allocation
      const task = await database.saveTask(
        taskDescription,
        match.agentId,
        match.explanation
      );

      // Find matched agent for display
      const matchedAgent = agents.find(a => a.id === match.agentId);
      if (!matchedAgent) throw new Error('Matched agent not found');

      // Update UI
      setSuccess('Task allocated successfully');
      setSelectedAgent(matchedAgent);
      setTaskDescription('');
    } catch (err) {
      setError(`Error allocating task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="task-allocation">
      <h1>Task Allocation</h1>

      <div className="task-form">
        <div className="form-group">
          <label htmlFor="taskDescription">Task Description</label>
          <textarea
            id="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            aria-label="Task Description"
            disabled={isAllocating}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isAllocating}
        >
          Allocate Task
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="agents-list">
        <h2>Available Agents</h2>
        {agents.map(agent => (
          <div
            key={agent.id}
            className={`agent-card ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
            onClick={() => handleAgentClick(agent)}
          >
            <h3>{agent.name}</h3>
            <p>Specialty: {agent.specialty}</p>
            
            {selectedAgent?.id === agent.id && workload && (
              <div className="agent-workload">
                <p>Active Tasks: {workload.activeTaskCount}</p>
                <p>Completion Rate: {Math.round(workload.completionRate * 100)}%</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedAgent && success && (
        <div className="allocation-result">
          <h2>Task Allocation Result</h2>
          <p>Assigned to: {selectedAgent.name}</p>
        </div>
      )}
    </div>
  );
};
