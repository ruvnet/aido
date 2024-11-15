import React, { useState, useEffect } from 'react';
import { OpenAIService } from '../../services/OpenAIService';
import { DatabaseService, Proposal } from '../../services/DatabaseService';

interface DecisionMakingProps {
  proposalId: string;
}

interface Evaluation {
  score: number;
  explanation: string;
}

export const DecisionMaking: React.FC<DecisionMakingProps> = ({ proposalId }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Initialize services
  const openAI = new OpenAIService('dummy-key');
  const database = new DatabaseService();

  useEffect(() => {
    const loadProposal = async () => {
      try {
        const loadedProposal = await database.getProposal(proposalId);
        if (!loadedProposal) {
          setError('Proposal not found');
          return;
        }
        setProposal(loadedProposal);
      } catch (err) {
        setError('Error loading proposal');
      }
    };

    loadProposal();
  }, [proposalId]);

  const handleEvaluate = async () => {
    setError('');
    setIsEvaluating(true);

    try {
      if (!proposal) {
        throw new Error('No proposal to evaluate');
      }

      // Evaluate using OpenAI
      const result = await openAI.evaluateProposal(proposal.content);
      
      // Save evaluation
      await database.saveEvaluation(
        proposalId,
        result.score,
        result.explanation
      );
      
      // Update UI
      setEvaluation(result);
    } catch (err) {
      setError(`Error evaluating proposal: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (error === 'Proposal not found') {
    return <div className="error">Proposal not found</div>;
  }

  return (
    <div className="decision-making">
      <h1>Proposal Evaluation</h1>

      {proposal && (
        <div className="proposal-content">
          <h2>Proposal Content</h2>
          <p>{proposal.content}</p>
        </div>
      )}

      <button 
        onClick={handleEvaluate}
        disabled={isEvaluating || !proposal}
      >
        Evaluate Proposal
      </button>

      {error && <div className="error">{error}</div>}

      {evaluation && (
        <div className="evaluation-results">
          <h2>Evaluation Results</h2>
          <p>Score: {evaluation.score}</p>
          <p>{evaluation.explanation}</p>
        </div>
      )}
    </div>
  );
};
