export type TaskStatus = "todo" | "in-progress" | "review" | "done"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type Status = "TD" | "IP" | "IR" | "D"
export type Priority = "L" | "M" | "H"

export interface Task {
  id?: string
  title?: string
  name?: string
  description?: string
  status?: TaskStatus | Status | string
  priority?: TaskPriority | Priority | string
  assignee?: string
  assignees?: any[]
  assigned?: any[]
  startDate?: string
  dueDate?: string
  start_date?: string
  end_date?: string
  phase?: any
  project?: any
  projectID?: string | number
  createdAt?: string
  updatedAt?: string
  subtasks?: Subtask[]
  attachments?: Attachment[]
  comments?: any[]
  tag?: string
  progress?: number
  isActive?: boolean
  isPaused?: boolean
  totalWorkTime?: number
  startTime?: number
  endTime?: number
  note?: string
  isArchived?: boolean
  state?: string
  created_at?: string
  updated_at?: string
  time_tracker?: string
}

export interface Subtask {
  id?: string
  subtask?: string
  title?: string
  done?: boolean
  is_completed?: boolean
  order?: number
  isOffline?: boolean
}

export interface Attachment {
  id?: string
  name?: string
  url?: string
  type?: string
  size?: number
}

export interface TeamMember {
  id: string | number
  name: string
  email?: string
  photoURL?: string
  avatarUrl?: string
}

export interface Phase {
  id: string | number
  name: string
  order?: number
  color?: string
  startDate?: string
  endDate?: string
}

export interface ListColumn {
  id: string
  title: string
  tasks?: Task[]
  items?: Task[]
}

export interface TaskColumn {
  id: TaskStatus
  title: string
  tasks: Task[]
}
