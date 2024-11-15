export interface IOpenAIService {
  generateProposal(topic: string, specialty: string): Promise<string>;
  evaluateProposal(content: string): Promise<{ score: number; explanation: string }>;
  matchTask(description: string, agents: Array<{ id: string; specialty: string }>): Promise<{
    agentId: string;
    explanation: string;
  }>;
}

export class OpenAIService implements IOpenAIService {
  constructor(private apiKey: string) {}

  async generateProposal(topic: string, specialty: string): Promise<string> {
    // In a real implementation, this would call the OpenAI API
    throw new Error('Not implemented');
  }

  async evaluateProposal(content: string): Promise<{ score: number; explanation: string }> {
    // In a real implementation, this would call the OpenAI API
    throw new Error('Not implemented');
  }

  async matchTask(
    description: string,
    agents: Array<{ id: string; specialty: string }>
  ): Promise<{ agentId: string; explanation: string }> {
    // In a real implementation, this would call the OpenAI API
    throw new Error('Not implemented');
  }
}
