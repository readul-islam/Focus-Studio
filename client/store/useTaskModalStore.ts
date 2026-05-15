import { create } from 'zustand';

type Task = any;
type TeamMember = any;

type TaskModalState = {
  // Modal state
  modalOpen: boolean;
  taskToEdit: Task | null;
  defaultStatus: string | undefined;
  defaultPhase: string | undefined;
  projectId: string | null;

  // Task form state
  taskValues: Task;
  selectedMembers: TeamMember[];

  // Comment state
  comment: {
    name: string;
    value: string;
    time: string;
    profileImg: string;
  };

  // UI state
  isDropdownOpen: boolean;
  showMentionDropdown: boolean;

  // Cached data
  teamMembers: TeamMember[];
  filteredUsers: TeamMember[];

  // Actions
  openModal: (options?: {
    projectId?: string | null;
    phase?: string;
    status?: string;
    taskToEdit?: Task | null;
  }) => void;
  closeModal: () => void;
  setTaskToEdit: (task: Task | null) => void;
  setTaskValues: (values: Task | ((prev: Task) => Task)) => void;
  setSelectedMembers: (members: TeamMember[] | ((prev: TeamMember[]) => TeamMember[])) => void;
  setComment: (comment: TaskModalState['comment'] | ((prev: TaskModalState['comment']) => TaskModalState['comment'])) => void;
  setIsDropdownOpen: (open: boolean) => void;
  setShowMentionDropdown: (show: boolean) => void;
  setTeamMembers: (members: TeamMember[]) => void;
  setFilteredUsers: (users: TeamMember[]) => void;
  resetTaskValues: () => void;
};

const initialTask: Task = {
  name: '',
  tag: '',
  progress: 0,
  dueDate: '',
  subtasks: [],
  attachments: [],
  priority: 'L',
  description: '',
  status: 'TD',
  assignee: '',
  phase: 'initial',
  projectID: '',
  comments: [],
  assigned: [],
  startTime: 0,
  endTime: 0,
  isActive: false,
  isPaused: false,
  totalWorkTime: 0,
  note: '',
};

const initialComment = {
  name: '',
  value: '',
  time: '',
  profileImg: '',
};

export const useTaskModalStore = create<TaskModalState>((set, get) => ({
  // Initial state
  modalOpen: false,
  taskToEdit: null,
  defaultStatus: undefined,
  defaultPhase: undefined,
  projectId: null,
  taskValues: initialTask,
  selectedMembers: [],
  comment: initialComment,
  isDropdownOpen: false,
  showMentionDropdown: false,
  teamMembers: [],
  filteredUsers: [],

  // Actions
  openModal: (options = {}) => {
    const { projectId = null, phase, status, taskToEdit = null } = options;

    set({
      modalOpen: true,
      projectId,
      defaultPhase: phase,
      defaultStatus: status,
      taskToEdit,
      taskValues: taskToEdit ? {
        ...initialTask,
        ...taskToEdit,
        subtasks: taskToEdit.subtasks?.map((st: any) => ({
          id: st.id,
          subtask: st.subtask,
          is_completed: st.is_completed || false,
          order: st.order,
          isOffline: false,
        })) || [],
        assigned: taskToEdit.assignees || [],
        projectID: taskToEdit.project?.id,
        startDate: taskToEdit.start_date,
        dueDate: taskToEdit.end_date,
      } : {
        ...initialTask,
        projectID: projectId || '',
        phase: phase || initialTask.phase,
        status: status || initialTask.status,
      },
    });
  },

  closeModal: () => {
    set({
      modalOpen: false,
      taskToEdit: null,
      defaultStatus: undefined,
      defaultPhase: undefined,
      taskValues: initialTask,
      comment: initialComment,
      selectedMembers: [],
      isDropdownOpen: false,
      showMentionDropdown: false,
    });
  },

  setTaskToEdit: (task) => set({ taskToEdit: task }),

  setTaskValues: (values) => {
    set((state) => ({
      taskValues: typeof values === 'function' ? values(state.taskValues) : values,
    }));
  },

  setSelectedMembers: (members) => {
    set((state) => ({
      selectedMembers: typeof members === 'function' ? members(state.selectedMembers) : members,
    }));
  },

  setComment: (comment) => {
    set((state) => ({
      comment: typeof comment === 'function' ? comment(state.comment) : comment,
    }));
  },

  setIsDropdownOpen: (open) => set({ isDropdownOpen: open }),

  setShowMentionDropdown: (show) => set({ showMentionDropdown: show }),

  setTeamMembers: (members) => set({ teamMembers: members, filteredUsers: members }),

  setFilteredUsers: (users) => set({ filteredUsers: users }),

  resetTaskValues: () => set({ taskValues: initialTask }),
}));
