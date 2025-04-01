
// Supabase database type definitions
export interface Holiday {
  id: string;
  name: string;
  description?: string | null;
  date: string; // Store as string in database format 'YYYY-MM-DD'
  created_at?: string;
  updated_at?: string;
}

export interface Timetable {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_start?: string | null;
  break_end?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Shift {
  id: string;
  name: string;
  timetable_id: string | null;
  department_id: string | null;
  start_date: string;
  end_date: string;
  color?: string | null;
  created_at?: string;
  updated_at?: string;
}

// For the ShiftsPage display with relations
export interface ShiftWithRelations extends Shift {
  timetable?: Timetable;
  department?: Department;
}
