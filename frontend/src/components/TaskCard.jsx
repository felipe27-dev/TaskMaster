// src/components/TaskCard.jsx (Merged for Editing)
import React from 'react';
import ReactDOM from 'react-dom';
import { Calendar, Trash2, Edit3, CheckSquare, Square } from 'react-feather'; // Added Edit3
import { Draggable } from 'react-beautiful-dnd';
import lodash from 'lodash';
import { format } from 'date-fns';

// Added onEditTask prop
export default function TaskCard({ task, onDeleteTask, onUpdateStatus, onEditTask, index }) {
    if (!task) return null;

    // Priority and Status classes (assuming these are correct from your complete version)
    let priorityClasses = 'bg-gray-500/30 text-gray-300';
    if (task.priority === 'alta') priorityClasses = 'bg-red-500/30 text-red-300';
    // else if (task.priority === 'Média') priorityClasses = 'bg-yellow-500/30 text-yellow-300'; // Assuming 'Média' might not be used based on modal
    else if (task.priority === 'normal') priorityClasses = 'bg-sky-500/30 text-sky-300';
    else if (task.priority === 'baixa') priorityClasses = 'bg-green-500/30 text-green-300';
    let checkbox = null; // Default checkbox state
    if (task.status === 'To Do') checkbox = <Square size={14} className="mr-1" />; // Checkbox for 'To Do'
    else checkbox = <CheckSquare size={14} className="mr-1" />; // Checkmark for 'Done'
    let statusClasses = 'bg-gray-500/30 text-gray-300'; // Default for 'To Do'
    if (task.status === 'Done') statusClasses = 'bg-green-500/30 text-green-300';

    const handleStatusClick = () => {
        if (!onUpdateStatus) {
            console.error("TaskCard: onUpdateStatus is not a function!");
            return;
        }
        // Toggle between 'To Do' and 'Done'
        const newStatus = task.status === 'To Do' ? 'Done' : 'To Do';
        onUpdateStatus(newStatus); // Pass only the new status
    };
    // Only allow clicking to change status if it's To Do or Done
    const isClickableStatus = task.status === 'To Do' || task.status === 'Done';

    const renderTaskCardContent = (providedDraggableSnapshot) => (
        <div
            ref={providedDraggableSnapshot.innerRef}
            {...providedDraggableSnapshot.draggableProps}
            {...providedDraggableSnapshot.dragHandleProps}
            className={`bg-slate-700 rounded-lg shadow-md p-3 mb-3 text-sm border border-slate-600 hover:border-slate-500 transition-shadow group ${providedDraggableSnapshot.isDragging ? 'shadow-2xl ring-2 ring-white transform scale-105 opacity-95' : 'shadow-md'}`}
        >
            <div className="flex justify-between items-start mb-1">
                <h3 className={`text-base font-semibold text-gray-100 break-words w-full pr-2 ${task.status === 'Done' ? 'line-through' : ''}`}>{task.title}</h3>
                {/* Action Buttons Container */}
                <div className="flex-shrink-0 flex items-center">
                    {/* Edit Button */}
                    {onEditTask && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent drag start or other card actions
                                if (typeof onEditTask === 'function') {
                                    onEditTask(task); // Pass the whole task object to the handler
                                } else {
                                    console.error('TaskCard: props.onEditTask is not a function!');
                                }
                            }}
                            className="p-1 rounded text-gray-400 hover:text-sky-400 hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                            aria-label="Editar tarefa"
                            title="Editar tarefa"
                        >
                            <Edit3 size={16} />
                        </button>
                    )}
                    {/* Delete Button */}
                    {onDeleteTask && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (typeof onDeleteTask === 'function') {
                                    onDeleteTask(task.id);
                                } else {
                                    console.error('TaskCard: props.onDeleteTask is not a function!');
                                }
                            }}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-slate-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                            aria-label="Deletar tarefa"
                            title="Deletar tarefa"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
            {task.description && (
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    {/* Format date - ensure task.delivery_date is a valid date object or string */}
                    <span>Descrição: {task.description}</span>
                </div>
            )}
            {/* Status and Priority Badges */}
            {(task.status || task.priority) && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {task.status && (
                        <span
                            className={`px-2 flex py-0.5 rounded-full text-xs font-medium ${statusClasses} ${isClickableStatus ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
                            onClick={isClickableStatus ? handleStatusClick : undefined}
                        >
                           <span>{checkbox}</span> {task.status === 'To Do' ? 'A fazer' : 'Feito'}
                        </span>
                    )}
                    {task.priority && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityClasses}`}>
                            Prioridade: {lodash.capitalize(task.priority)}
                        </span>
                    )}
                </div>
            )}
            {/* Delivery Date */}
            {task.delivery_date && (
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Calendar size={14} />
                    {/* Format date - ensure task.delivery_date is a valid date object or string */}
                    <span>Prazo: {format(new Date(task.delivery_date), 'dd/MM/yyyy')}</span>
                </div>
            )}
            {/* Tags (if used) */}
            {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Tag size={14} />
                    <span>{task.tags.join(', ')}</span>
                </div>
            )}
        </div>
    );

    return (
        <Draggable draggableId={task.id.toString()} index={index}>
            {(provided, snapshot) => {
                // Use the render function for content
                const component = renderTaskCardContent(provided);
                // Portal for dragging effect
                if (snapshot.isDragging) {
                    return ReactDOM.createPortal(component, document.body);
                }
                return component;
            }}
        </Draggable>
    );
}

