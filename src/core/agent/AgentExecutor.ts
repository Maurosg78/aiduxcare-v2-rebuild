import type { AgentSuggestion } from "../types/agent";
import { ClinicalAgent } from "./ClinicalAgent";
import { AgentContext } from "./AgentContextBuilder";

export class AgentExecutor {
  private agent: ClinicalAgent;

  constructor() {
    this.agent = new ClinicalAgent();
  }

  public async execute(context: AgentContext): Promise<AgentSuggestion[]> {
    const suggestions = await this.agent.generateSuggestions(context);
    return suggestions;
  }
}
