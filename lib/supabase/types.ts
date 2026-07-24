// Source of truth: the matching schema lives in
// supabase/migrations/20260719000001_init_scores.sql.
// Regenerate with `npm run db:types` after every new migration.

export interface Database {
  public: {
    Tables: {
      scores: {
        Row: {
          id: string;
          game: string;
          score: number;
          name: string;
          user_id: string | null;
          at: string;
        };
        Insert: {
          id?: string;
          game: string;
          score: number;
          name: string;
          user_id?: string | null;
          at?: string;
        };
        Update: {
          id?: string;
          game?: string;
          score?: number;
          name?: string;
          user_id?: string | null;
          at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
