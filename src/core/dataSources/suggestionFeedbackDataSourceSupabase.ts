import { supabase } from "@/lib/supabaseClient";
import { SuggestionFeedback, SuggestionFeedbackDataSource } from "./SuggestionFeedbackDataSource";

export const suggestionFeedbackDataSourceSupabase: SuggestionFeedbackDataSource = {
  getFeedbacksByVisit: async (visitId: string) => {
    const { data, error } = await supabase
      .from("suggestion_feedback")
      .select("*")
      .eq("visit_id", visitId);
    
    if (error) throw error;
    return (data || []) as SuggestionFeedback[];
  },

  getFeedbackBySuggestion: async (suggestionId: string) => {
    const { data, error } = await supabase
      .from("suggestion_feedback")
      .select("*")
      .eq("suggestion_id", suggestionId)
      .single();
    
    if (error) throw error;
    return data as SuggestionFeedback | null;
  }
};

const saveFeedback = async (feedback: SuggestionFeedback): Promise<void> => {
  const { error } = await supabase
    .from("suggestion_feedback")
    .insert([feedback]);

  if (error) {
    console.error("Error saving feedback:", error);
    throw error;
  }
};

export { saveFeedback }; 