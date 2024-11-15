import React, { useState, useEffect } from 'react';
import { DatabaseService, Proposal, Evaluation } from '../../services/DatabaseService';

interface ConsensusAlgorithmProps {
  proposalId: string;
}

interface ConsensusMetrics {
  averageScore: number;
  consensusStrength: 'Low' | 'Medium' | 'High';
  scoreVariance: 'Low' | 'Medium' | 'High';
  participationRate: number;
}

export const ConsensusAlgorithm: React.FC<ConsensusAlgorithmProps> = ({ proposalId }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [metrics, setMetrics] = useState<ConsensusMetrics | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [consensusReached, setConsensusReached] = useState(false);

  const database = new DatabaseService();

  useEffect(() => {
    loadProposalAndEvaluations();
  }, [proposalId]);

  const loadProposalAndEvaluations = async () => {
    try {
      const [loadedProposal, loadedEvaluations] = await Promise.all([
        database.getProposal(proposalId),
        database.getEvaluations(proposalId)
      ]);

      if (!loadedProposal) {
        setError('Proposal not found');
        return;
      }

      setProposal(loadedProposal);
      setEvaluations(loadedEvaluations);
      
      if (loadedEvaluations.length > 0) {
        calculateMetrics(loadedEvaluations);
      }
    } catch (err) {
      setError(`Error loading data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const calculateMetrics = (evals: Evaluation[]) => {
    const scores = evals.map(e => e.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Calculate variance
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - average, 2), 0) / scores.length;
    const scoreVariance = variance < 1 ? 'Low' : variance < 2 ? 'Medium' : 'High';
    
    // Calculate consensus strength based on variance and participation
    const consensusStrength = 
      variance < 1 && scores.length >= 3 ? 'High' :
      variance < 2 && scores.length >= 2 ? 'Medium' : 'Low';

    setMetrics({
      averageScore: Number(average.toFixed(1)),
      consensusStrength,
      scoreVariance,
      participationRate: 100 // In a real implementation, this would be calculated based on total possible evaluators
    });
  };

  const calculateConsensus = async () => {
    if (!metrics || !proposal) return;
    
    setIsProcessing(true);
    setError('');

    try {
      const status = metrics.averageScore >= 7 ? 'accepted' : 'rejected';
      await database.updateProposalStatus(proposalId, status);
      setConsensusReached(true);
      setProposal(prev => prev ? { ...prev, status } : null);
    } catch (err) {
      setError(`Error reaching consensus: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="consensus-algorithm">
      <h1>Consensus Algorithm</h1>

      {!proposal ? (
        <div className="error">{error || 'Loading...'}</div>
      ) : (
        <>
          <div className="proposal-content">
            <h2>Proposal</h2>
            <p>{proposal.content}</p>
          </div>

          <div className="evaluations-summary">
            <h2>Evaluations</h2>
            <p>Total Evaluations: {evaluations.length}</p>
            {evaluations.length === 0 && (
              <p className="warning">Insufficient evaluations to reach consensus</p>
            )}
          </div>

          {metrics && (
            <div className="consensus-metrics">
              <h2>Consensus Metrics</h2>
              <p>Average Score: {metrics.averageScore.toFixed(1)}</p>
              <p>Consensus Strength: {metrics.consensusStrength}</p>
              <p>Score Variance: {metrics.scoreVariance}</p>
              <p>Participation Rate: {metrics.participationRate}%</p>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {evaluations.length > 0 && !consensusReached && (
            <button
              onClick={calculateConsensus}
              disabled={isProcessing || consensusReached}
            >
              Calculate Consensus
            </button>
          )}

          {consensusReached && (
            <div className="consensus-result">
              <h2>Consensus Reached: {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}</h2>
            </div>
          )}
        </>
      )}
    </div>
  );
};
