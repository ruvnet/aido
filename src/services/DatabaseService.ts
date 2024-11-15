export interface Agent {
  id: string;
  name: string;
  specialty: string;
}

export interface Proposal {
  id: string;
  content: string;
  agentSpecialty: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Evaluation {
  id: string;
  proposalId: string;
  score: number;
  explanation: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  description: string;
  assignedAgentId: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  createdAt: Date;
}

export interface AgentWorkload {
  activeTaskCount: number;
  completionRate: number;
}

export interface AgentPerformance {
  id: string;
  name: string;
  completedTasks: number;
  acceptedProposals: number;
  averageRating: number;
}

export interface PerformanceMetrics {
  proposals: {
    total: number;
    accepted: number;
    rejected: number;
    averageEvaluationTime: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    averageCompletionTime: number;
  };
  agents: AgentPerformance[];
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface IDatabaseService {
  saveProposal(content: string, specialty: string): Promise<Proposal>;
  getAgents(): Promise<Agent[]>;
  getProposal(id: string): Promise<Proposal | null>;
  saveEvaluation(proposalId: string, score: number, explanation: string): Promise<Evaluation>;
  getEvaluations(proposalId: string): Promise<Evaluation[]>;
  updateProposalStatus(proposalId: string, status: 'accepted' | 'rejected'): Promise<Proposal>;
  saveTask(description: string, agentId: string, explanation: string): Promise<Task>;
  getAgentWorkload(agentId: string): Promise<AgentWorkload>;
  getPerformanceMetrics(dateRange?: DateRange): Promise<PerformanceMetrics>;
}

export class DatabaseService implements IDatabaseService {
  async saveProposal(content: string, specialty: string): Promise<Proposal> {
    // In a real implementation, this would save to the database
    throw new Error('Not implemented');
  }

  async getAgents(): Promise<Agent[]> {
    // In a real implementation, this would fetch from the database
    throw new Error('Not implemented');
  }

  async getProposal(id: string): Promise<Proposal | null> {
    // In a real implementation, this would fetch from the database
    throw new Error('Not implemented');
  }

  async saveEvaluation(proposalId: string, score: number, explanation: string): Promise<Evaluation> {
    // In a real implementation, this would save to the database
    throw new Error('Not implemented');
  }

  async getEvaluations(proposalId: string): Promise<Evaluation[]> {
    // In a real implementation, this would fetch from the database
    throw new Error('Not implemented');
  }

  async updateProposalStatus(proposalId: string, status: 'accepted' | 'rejected'): Promise<Proposal> {
    // In a real implementation, this would update the database
    throw new Error('Not implemented');
  }

  async saveTask(description: string, agentId: string, explanation: string): Promise<Task> {
    // In a real implementation, this would save to the database
    throw new Error('Not implemented');
  }

  async getAgentWorkload(agentId: string): Promise<AgentWorkload> {
    // In a real implementation, this would calculate from the database
    throw new Error('Not implemented');
  }

  async getPerformanceMetrics(dateRange?: DateRange): Promise<PerformanceMetrics> {
    // In a real implementation, this would calculate metrics from the database
    throw new Error('Not implemented');
  }
}
