import type { MemoryBlock } from "../mcp/MemoryStore";

export interface AgentContext {
  transcript: MemoryBlock[];
  // ... otros campos de contexto
}

export class AgentContextBuilder {
  private context: AgentContext;

  constructor() {
    this.context = {
      transcript: [],
    };
  }

  public withTranscript(transcript: MemoryBlock[]): this {
    this.context.transcript = transcript;
    return this;
  }

  public build(): AgentContext {
    return this.context;
  }
}
