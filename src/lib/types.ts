export interface Resident {
  id: string
  flat_number: string
  name: string
  whatsapp_number: string
  email: string
  role: 'resident' | 'admin'
  must_change_password: boolean
  is_active: boolean
  created_at: string
}

export interface Book {
  id: string
  isbn: string
  title: string
  author: string
  cover_url: string | null
  added_at: string
}

export interface Borrowing {
  id: string
  book_id: string
  resident_id: string
  borrowed_at: string
  due_at: string
  returned_at: string | null
  checked_out_by: string | null
  checked_in_by: string | null
  book?: Book
  resident?: Resident
}

export interface VolunteerRequest {
  id: string
  resident_id: string
  requested_date: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  approved_by: string | null
  created_at: string
  resident?: Resident
}

export interface AppSettings {
  max_books_per_resident: number
  default_due_weeks: number
}
