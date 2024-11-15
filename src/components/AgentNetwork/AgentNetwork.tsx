import React, { useState, useEffect } from 'react';
import { OpenAIService } from '../../services/OpenAIService';
import { DatabaseService, Agent } from '../../services/DatabaseService';

interface AgentNetworkProps {
  openAIService?: OpenAIService;
  databaseService?: DatabaseService;
  onProposalCreated?: (proposalId: string) => void;
}

export const AgentNetwork: React.FC<AgentNetworkProps> = ({ 
  onProposalCreated,
  openAIService,
  databaseService
}) => {
  const [topic, setTopic] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [proposal, setProposal] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true);
      try {
        const loadedAgents = await databaseService?.getAgents();
        setAgents(loadedAgents || []);
        setError('');
      } catch (err) {
        setError('Error loading agents');
        setAgents([]);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    if (databaseService) {
      loadAgents();
    }
  }, [databaseService]);

  const handleGenerateProposal = async () => {
    try {
      // Reset states
      setError('');
      setSuccess(false);
      setProposal('');
      setIsLoading(true);

      // Validate input
      if (!topic.trim()) {
        setError('Please enter a proposal topic');
        setIsLoading(false);
        return;
      }

      if (!selectedSpecialty) {
        setError('Please select an agent specialty');
        setIsLoading(false);
        return;
      }

      if (!openAIService || !databaseService) {
        setError('Services not initialized');
        setIsLoading(false);
        return;
      }

      // Generate proposal using OpenAI
      const generatedProposal = await openAIService.generateProposal(topic, selectedSpecialty);
      if (!generatedProposal) {
        setError('Failed to generate proposal');
        setIsLoading(false);
        return;
      }

      // Save to database
      const savedProposal = await databaseService.saveProposal(generatedProposal, selectedSpecialty);
      
      // Update UI
      setProposal(generatedProposal);
      setSuccess(true);

      // Notify parent component
      if (onProposalCreated) {
        onProposalCreated(savedProposal.id);
      }
    } catch (err) {
      setError(`Error generating proposal: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
      setSuccess(false);
      setProposal(''); // Clear any previous proposal
    } finally {
      setIsLoading(false);
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
        {isLoading ? (
          <div>Loading agents...</div>
        ) : (
          <select
          id="specialty"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          aria-label="Agent Specialty"
          className="form-control"
        >
          <option value="">Select Specialty</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.specialty}>
                {agent.specialty}
              </option>
            ))}
          </select>
        )}
      </div>

      <button 
        onClick={handleGenerateProposal}
        className="generate-button"
        disabled={isLoading || !isInitialized}
      >
        Generate Proposal
      </button>

      <div 
        className="error-message" 
        role="alert" 
        data-testid="error-message"
        style={{ display: error ? 'block' : 'none' }}
      >
        {error}
      </div>
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
