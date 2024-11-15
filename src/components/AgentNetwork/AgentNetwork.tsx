import React, { useState, useEffect } from 'react';
import { OpenAIService } from '../../services/OpenAIService';
import { DatabaseService, Agent } from '../../services/DatabaseService';

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

  // Initialize services
  const openAI = new OpenAIService('dummy-key');
  const database = new DatabaseService();

  useEffect(() => {
    // Load available agents on mount
    const loadAgents = async () => {
      try {
        const loadedAgents = await database.getAgents();
        setAgents(loadedAgents);
      } catch (err) {
        setError('Error loading agents');
      }
    };

    loadAgents();
  }, []);

  const handleGenerateProposal = async () => {
    // Reset states
    setError('');
    setSuccess(false);
    setProposal('');

    // Validate input
    if (!topic) {
      setError('Please enter a proposal topic');
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
        />
      </div>

      <div className="form-group">
        <label htmlFor="specialty">Agent Specialty</label>
        <select
          id="specialty"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          aria-label="Agent Specialty"
        >
          <option value="">Select Specialty</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.specialty}>
              {agent.specialty}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleGenerateProposal}>Generate Proposal</button>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Proposal generated successfully!</div>}
      {proposal && (
        <div className="proposal">
          <h2>Generated Proposal</h2>
          <p>{proposal}</p>
        </div>
      )}
    </div>
  );
};
