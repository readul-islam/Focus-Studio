'use client';
import React, { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { GripVertical, CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';

const DragHandle = SortableHandle(() => (
  <span className=" cursor-grab active:cursor-grabbing">
    <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-700" aria-hidden="true" />
  </span>
));

// Enhanced input with mention functionality
const SubtaskInput = React.forwardRef<
  HTMLInputElement,
  { 
    value: string; 
    onChange: (v: string) => void; 
    className?: string; 
    placeholder?: string;
    usersData?: any[];
  }
>(({ value, onChange, className, placeholder, usersData = [] }, forwardedRef) => {
  const innerRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const enterPressedRef = useRef(false);
  
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  // stable callback ref that assigns both internal ref and forwarded ref
  const setRefs = useCallback(
    (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (!forwardedRef) return;
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else (forwardedRef as any).current = el;
    },
    [forwardedRef]
  );

  // Filter users based on mention search
  const filteredUsers = useMemo(() => {
    if (!mentionSearch) return usersData;
    return usersData.filter(user => 
      user.name?.toLowerCase().includes(mentionSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(mentionSearch.toLowerCase())
    );
  }, [mentionSearch, usersData]);

  // Commit value to parent on blur or Enter key
  const commit = useCallback(() => {
    if (!innerRef.current) return;
    // Skip if Enter was just pressed (to avoid double call)
    if (enterPressedRef.current) {
      enterPressedRef.current = false;
      return;
    }
    const val = innerRef.current.value || '';
    onChange(val);
  }, [onChange]);

  // Handle mention selection
  const insertMention = useCallback((user: any) => {
    if (!innerRef.current) return;
    
    const currentValue = innerRef.current.value;
    const beforeCursor = currentValue.slice(0, cursorPosition);
    const afterCursor = currentValue.slice(cursorPosition);
    
    // Find the @ symbol position
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const before = beforeCursor.slice(0, lastAtIndex);
      const mentionText = `@${user.name} `;
      const newValue = before + mentionText + afterCursor;
      
      innerRef.current.value = newValue;
      onChange(newValue);
      
      // Set cursor position after mention
      const newCursorPos = (before + mentionText).length;
      innerRef.current.setSelectionRange(newCursorPos, newCursorPos);
      innerRef.current.focus();
    }
    
    setShowMentionDropdown(false);
    setMentionSearch('');
    setSelectedMentionIndex(0);
  }, [cursorPosition, onChange]);

  // Handle input change to detect @ mentions
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;
    const cursorPos = input.selectionStart || 0;
    
    setCursorPosition(cursorPos);
    
    // Check if we're typing after an @
    const beforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    // Check if there's a space after the @ (which would end the mention)
    const textAfterAt = beforeCursor.slice(lastAtIndex + 1);
    const hasSpaceAfterAt = textAfterAt.includes(' ');
    
    if (lastAtIndex !== -1 && !hasSpaceAfterAt && cursorPos > lastAtIndex) {
      // We're typing a mention
      const searchTerm = beforeCursor.slice(lastAtIndex + 1);
      setMentionSearch(searchTerm);
      setShowMentionDropdown(true);
      setSelectedMentionIndex(0);
    } else {
      setShowMentionDropdown(false);
      setMentionSearch('');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          innerRef.current && !innerRef.current.contains(event.target as Node)) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1">
      <input
        ref={setRefs}
        type="text"
        defaultValue={value}
        onInput={handleInput}
        onBlur={commit}
        onKeyDown={e => {
          if (showMentionDropdown) {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedMentionIndex(prev => 
                prev < filteredUsers.length - 1 ? prev + 1 : prev
              );
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0);
            } else if (e.key === 'Enter' && filteredUsers.length > 0) {
              e.preventDefault();
              insertMention(filteredUsers[selectedMentionIndex]);
              return;
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setShowMentionDropdown(false);
              return;
            }
          }
          
          if (e.key === 'Enter' && !showMentionDropdown) {
            e.preventDefault();
            enterPressedRef.current = true;
            const val = e.currentTarget.value || '';
            onChange(val);
            e.currentTarget.blur();
          }
        }}
        className={className}
        placeholder={placeholder}
      />
      
      {showMentionDropdown && filteredUsers.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur from firing
                insertMention(user);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-stone-100 ${
                index === selectedMentionIndex ? 'bg-stone-100' : ''
              }`}
            >
              <div className="font-medium text-sm text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const ItemComponent = ({ subtask, onCheck, onEdit, onDelete, inputRef, usersData }: any) => {
  return (
    <div className="subtask-row hover:shadow-sm group duration-300 flex items-center gap-2 rounded-xl bg-white/80 border border-gray-200 pl-2 pr-2 h-10">
      <Checkbox
        checked={subtask?.is_completed}
        onCheckedChange={() => onCheck(subtask.id)}
        className="mr-1 focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
        aria-label="Toggle subtask"
      />

      <SubtaskInput
        data-subtask-id={subtask.id}
        ref={inputRef}
        value={subtask.subtask || ''}
        onChange={val => onEdit(subtask.id, val)}
        className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent h-9 text-sm w-full"
        placeholder="Subtask..."
        usersData={usersData}
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-gray-700"
        onClick={() => onDelete(subtask.id)}
        aria-label="Remove subtask"
        title="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DragHandle />
    </div>
  );
};

const MemoizedItem = React.memo(ItemComponent, (prev: any, next: any) => {
  // Only re-render if relevant subtask fields changed
  return prev.subtask.id === next.subtask.id && prev.subtask.subtask === next.subtask.subtask && prev.subtask.is_completed === next.subtask.is_completed;
});

const SortableItem = SortableElement(MemoizedItem as any);

const SortableList = SortableContainer(({ subtasks, onCheck, onEdit, onDelete, inputRefs, inputRefCallbacks, usersData }: any) => (
  <div className="space-y-2">
    {(subtasks || []).map((subtask: any, index: number) => (
      <SortableItem
        key={subtask.id}
        index={index}
        subtask={subtask}
        onCheck={onCheck}
        onEdit={onEdit}
        onDelete={onDelete}
        usersData={usersData}
        inputRef={
          inputRefCallbacks.current[subtask.id] ||
          (inputRefCallbacks.current[subtask.id] = (el: any) => {
            inputRefs.current[subtask.id] = el;
          })
        }
      />
    ))}
  </div>
));

const DraggableSubtasks2 = React.forwardRef(({
  subtasks,
  setTaskValues,
  taskId,
  setMentionSub,
  teamMembers,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  studioId,
  userId,
  canEdit = true,
}: any, ref: any) => {
  const sortedSubtasks = [...(subtasks || [])].sort((a, b) => a.order - b.order);
  const {user} = useUser();
    const { data: usersData, isLoading: usersLoading } = useFetch(
      user?.studio?.id ? `user/studio-users/?studio_id=${user.studio.id}` : null
    );



  const inputRefs = useRef({});
  // Keep stable ref-callbacks per-subtask so React doesn't call previous ref with null
  // on every render (which can blur the input and move the caret).
  const inputRefCallbacks = useRef({});

  const onSortEnd = async ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const newItems = arrayMove(sortedSubtasks, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      order: idx,
    }));

    setTaskValues(prev => ({
      ...prev,
      subtasks: newItems,
    }));

    // console.log('onSortEnd - updateSubtask:', !!updateSubtask, 'taskId:', taskId);
    // console.log('onSortEnd - newItems:', newItems);

    // Update order on server for each affected subtask
    if (updateSubtask) {
      newItems.forEach(item => {
        // console.log('Checking item:', item.id, 'isOffline:', item.isOffline);
        if (item.id && !item.isOffline) {
          updateSubtask({
            id: item.id,
            order: item.order,
            is_completed: item.is_completed || false,
          });
        }
      });
    }
  };

  const handleCheck = useCallback(
    id => {
      const subtask = sortedSubtasks.find(st => st.id === id);
      const newSelectedState = !subtask?.is_completed;

      setTaskValues((prev: any) => ({
        ...prev,
        subtasks: prev.subtasks.map((task: any) => (task.id === id ? { ...task, is_completed: newSelectedState } : task)),
      }));

      // Update on server if not offline
      if (subtask && !subtask.isOffline && updateSubtask) {
        updateSubtask({
          id: id,
          is_completed: newSelectedState,
        });
      }
    },
    [setTaskValues, updateSubtask, sortedSubtasks]
  );

  const handleEdit = useCallback(
    (id, value) => {
      setTaskValues((prev: any) => ({
        ...prev,
        subtasks: prev.subtasks.map((task: any) => (task.id === id ? { ...task, subtask: value } : task)),
      }));

      // Update on server if not offline, otherwise create it
      const subtask = sortedSubtasks.find(st => st.id === id);

      if (subtask) {
        if (!subtask.isOffline) {
          if (updateSubtask) {
            updateSubtask({
              id: id,
              subtask: value,
              order: subtask.order,
              studio: studioId,
              is_completed: subtask.is_completed || false,
            });
          }
        } else {
          // It's offline (new), so create it
          if (createSubtask && value.trim()) {
            createSubtask({
              url: 'task/subtasks/',
              data: {
                subtask: value,
                order: subtask.order,
                studio: studioId,
                is_completed: subtask.is_completed || false,
                task: taskId, // Associate with task
              },
            });
          }
        }
      } else if (!taskId && subtask?.isOffline) {
        // Task hasn't been saved yet, keep subtask offline
      }
    },
    [setTaskValues, updateSubtask, createSubtask, taskId, sortedSubtasks, studioId, userId]
  );

  const handleDelete = useCallback(
    id => {
      setTaskValues(prev => ({
        ...prev,
        subtasks: prev.subtasks.filter(task => task.id !== id),
      }));

      // Delete from server if not offline
      const subtask = sortedSubtasks.find(st => st.id === id);
      if (deleteSubtask && subtask && !subtask.isOffline) {
        deleteSubtask({ url: `task/subtasks/${id}/` });
      }
    },
    [setTaskValues, deleteSubtask, sortedSubtasks]
  );

  const handleAdd = () => {
    const newId = `subtask-${Date.now()}`;
    const maxOrder = Math.max(...(sortedSubtasks?.map(st => st.order) || [0]), 0);
    const newSubtask = {
      id: newId,
      subtask: '',
      is_completed: false,
      order: maxOrder + 1,
      isOffline: true,
    };

    setTaskValues(prev => ({
      ...prev,
      subtasks: [
        ...(prev.subtasks || []),
        newSubtask,
      ],
    }));

    // Don't create on server yet, wait for user input (handled in handleEdit)

    // Focus on the new input after a short delay to ensure DOM is updated
    setTimeout(() => {
      if (inputRefs.current[newId]) {
        inputRefs.current[newId].focus();
      }
    }, 100);
  };

  // Method to focus on the last input (called from parent component)
  const focusLastInput = useCallback(() => {
    setTimeout(() => {
      const lastSubtask = sortedSubtasks[sortedSubtasks.length - 1];
      if (lastSubtask && inputRefs.current[lastSubtask.id]) {
        inputRefs.current[lastSubtask.id].focus();
      }
    }, 100);
  }, [sortedSubtasks]);

  // Expose the focusLastInput method to parent component
  React.useImperativeHandle(ref, () => ({
    focusLastInput,
  }));

  return (
    <div className="">
      <SortableList
        subtasks={sortedSubtasks}
        onSortEnd={onSortEnd}
        useDragHandle
        lockAxis="y"
        helperClass="sortable-helper"
        onCheck={handleCheck}
        onEdit={handleEdit}
        onDelete={handleDelete}
        inputRefs={inputRefs}
        inputRefCallbacks={inputRefCallbacks}
        usersData={usersData}
      />

      {canEdit && (
        <div className="flex justify-end mt-3">
          <Button onClick={handleAdd}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') handleAdd();
          }} type="button" variant="ghost" size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add subtask
          </Button>
        </div>
      )}
    </div>
  );
});

export default DraggableSubtasks2;
