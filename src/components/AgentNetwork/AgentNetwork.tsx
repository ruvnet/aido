import React, { useState, useEffect } from 'react';
import { OpenAIService } from '../../services/OpenAIService';
import { DatabaseService, Agent } from '../../services/DatabaseService';

// Initialize services once outside component
const openAI = new OpenAIService('test-api-key');
const database = new DatabaseService();

interface AgentNetworkProps {
  onProposalCreated?: (proposalId: string) => void;
}

export const AgentNetwork: React.FC<AgentNetworkProps> = ({ onProposalCreated }) => {
  const [topic, setTopic] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [proposal, setProposal] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const loadedAgents = await database.getAgents();
      setAgents(loadedAgents || []);
      if (loadedAgents?.length > 0) {
        setSelectedSpecialty(loadedAgents[0].specialty);
      }
    } catch (err) {
      setError('Error loading agents');
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    // Reset states
    setError('');
    setSuccess(false);
    setProposal('');

    // Validate input
    if (!topic.trim()) {
      setError('Please enter a proposal topic');
      return;
    }

    if (!selectedSpecialty) {
      setError('Please select an agent specialty');
      return;
    }

    try {
      // Generate proposal using OpenAI
      const generatedProposal = await openAI.generateProposal(topic, selectedSpecialty);
      
      // Save to database
      const savedProposal = await database.saveProposal(generatedProposal, selectedSpecialty);
      
      // Update UI
      setProposal(generatedProposal);
      setSuccess(true);

      // Notify parent component
      if (onProposalCreated) {
        onProposalCreated(savedProposal.id);
      }
    } catch (err) {
      setError(`Error generating proposal: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="agent-network">
      <h1>AI Agent Network</h1>
      
      <div className="form-group">
        <label htmlFor="topic">Proposal Topic</label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          aria-label="Proposal Topic"
          className="form-control"
          placeholder="Enter proposal topic"
        />
      </div>

      <div className="form-group">
        <label htmlFor="specialty">Agent Specialty</label>
        <select
          id="specialty"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          aria-label="Agent Specialty"
          className="form-control"
        >
          <option value="">Select Specialty</option>
          {!isLoading && agents && agents.map((agent) => (
            <option key={agent.id} value={agent.specialty}>
              {agent.specialty}
            </option>
          ))}
        </select>
      </div>

      <button 
        onClick={handleGenerateProposal}
        className="generate-button"
        disabled={!topic.trim() || !selectedSpecialty}
      >
        Generate Proposal
      </button>

      {error && (
        <div className="error-message" role="alert" data-testid="error-message">
          {error}
        </div>
      )}
      {success && (
        <div className="success-message" role="status" data-testid="success-message">
          Proposal generated successfully!
        </div>
      )}
      {proposal && (
        <div className="proposal-container" data-testid="proposal-container">
          <h2>Generated Proposal</h2>
          <p className="proposal-content">{proposal}</p>
        </div>
      )}
    </div>
  );
};
