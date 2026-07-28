import { DEFAULT_SUGGESTED_QUESTIONS, ASK_LOOP_LIMITS } from "./ask-loop.constants.js";

export const askLoopSuggestion = {
  getDefaults(): string[] {
    return Array.from(DEFAULT_SUGGESTED_QUESTIONS).slice(
      0,
      ASK_LOOP_LIMITS.SUGGESTION_LIMIT,
    );
  },

  async getPersonalized(
    _workspaceId: string,
    _userId: string,
  ): Promise<string[]> {
    return this.getDefaults();
  },
};
