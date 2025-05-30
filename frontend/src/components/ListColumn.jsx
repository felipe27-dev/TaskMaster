// src/components/ListColumn.jsx (Merged for Editing)
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import TaskCard from './TaskCard'; // Assuming TaskCard_merged.jsx is renamed or imported correctly
import CreateTaskModal from './CreateTaskModal'; // Assuming CreateTaskModal_merged.jsx is renamed or imported correctly
import { Trash2, Plus } from 'react-feather';
import { Droppable, Draggable } from 'react-beautiful-dnd';

// Added onUpdateCard prop to receive the update handler from TaskBoard
const ListColumn = ({ list, index, onDeleteList, onAddCard, onDeleteCard, onUpdateTaskStatus, onUpdateCard, isPinnedContext = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null); // State to hold the task being edited

    // Opens the modal for creating a new task
    const handleOpenCreateModal = () => {
        setEditingTask(null); // Ensure not in edit mode
        setIsModalOpen(true);
    };

    // Opens the modal for editing an existing task
    const handleOpenEditModal = (taskToEdit) => {
        setEditingTask(taskToEdit); // Set the task to be edited
        setIsModalOpen(true);
    };

    // Closes the modal and resets editing state
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    // Unified handler for modal submission (Create or Update)
    const handleSubmitModal = (currentListId, taskDetails) => {
        if (editingTask) {
            // If editingTask is set, call the update function
            if (typeof onUpdateCard === 'function') {
                console.log('ListColumn: handleSubmitModal (Update) calling onUpdateCard with:', { listId: currentListId, taskId: editingTask.id, taskDetails });
                onUpdateCard(editingTask.id, taskDetails); // Pass task ID and updated details
            } else {
                console.error('ListColumn: props.onUpdateCard is not a function!');
            }
        } else {
            // Otherwise, call the create function
            if (typeof onAddCard === 'function') {
                console.log('ListColumn: handleSubmitModal (Create) calling onAddCard with:', { listId: currentListId, taskDetails });
                onAddCard(currentListId, taskDetails);
            } else {
                console.error('ListColumn: props.onAddCard is not a function!');
            }
        }
        handleCloseModal(); // Close modal after action
    };

    const cardAreaMaxHeight = isPinnedContext
        ? 'max-h-[110px]'
        : 'max-h-[calc(100vh-350px)]';

    const columnContent = (dragProvided, dragSnapshot) => (
        <div
            {...dragProvided.draggableProps}
            ref={dragProvided.innerRef}
            className={`flex flex-col bg-slate-800/70 rounded-xl p-0 space-y-3 h-fit flex-shrink-0 w-72 shadow-lg border border-slate-700 ${dragSnapshot.isDragging ? 'ring-2 ring-sky-500 shadow-2xl opacity-95' : ''}`}
        >
            {/* Column Header */}
            <div {...dragProvided.dragHandleProps} className="flex justify-between items-center p-4 pt-3 pb-1 rounded-t-xl cursor-grab hover:bg-slate-700/50">
                <h2 className="text-white text-lg font-semibold">{list.title}</h2>
                <button
                    onClick={() => {
                        if (typeof onDeleteList === 'function') onDeleteList(list.id);
                        else console.error('ListColumn: props.onDeleteList is not a function!');
                    }}
                    className="p-1 rounded hover:bg-red-600/70 text-gray-400 hover:text-white transition-colors"
                    aria-label="Deletar lista"
                >
                    <Trash2 size={18} />
                </button>
            </div>
            {/* Droppable Area for Cards */}
            <Droppable droppableId={list.id.toString()} type="CARD">
                {(providedDroppable, snapshotDroppable) => (
                    <div
                        ref={providedDroppable.innerRef}
                        {...providedDroppable.droppableProps}
                        className={`space-y-3 overflow-y-auto ${cardAreaMaxHeight} min-h-[60px] px-4 pb-1 custom-scrollbar rounded-b-md ${snapshotDroppable.isDraggingOver ? 'bg-slate-700/50' : 'bg-transparent'}`}
                    >
                        {/* Map through tasks (cards) */}
                        {(Array.isArray(list.cards) ? list.cards : []).map((card, cardIndex) => (
                            <TaskCard
                                key={card.id} task={card} index={cardIndex}
                                onDeleteTask={(taskId) => { if (typeof onDeleteCard === 'function') onDeleteCard(list.id, taskId); else console.error('ListColumn: props.onDeleteCard is not a function!'); }}
                                onUpdateStatus={(newStatus) => {
                                    if (typeof onUpdateTaskStatus === 'function') {
                                        onUpdateTaskStatus(list.id, card.id, newStatus);
                                    } else {
                                        console.error('ListColumn: props.onUpdateTaskStatus is not a function!');
                                    }
                                }}
                                // Pass the handler to open the modal in edit mode
                                onEditTask={handleOpenEditModal}
                            />
                        ))}
                        {providedDroppable.placeholder}
                    </div>
                )}
            </Droppable>
            {/* Add Task Button */}
            <div className="p-4 pt-1">
                <button
                    onClick={handleOpenCreateModal} // Opens modal for creating
                    className="flex items-center justify-center p-2 w-full rounded-md mt-auto bg-slate-700/80 hover:bg-slate-600/90 text-gray-300 hover:text-white transition-colors"
                >
                    <Plus size={18} className="mr-2" /> Adicionar Tarefa
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Draggable Column */}
            <Draggable draggableId={list.id.toString()} index={index}>
                {(provided, snapshot) => {
                    const component = columnContent(provided, snapshot);
                    // Use portal for dragging effect
                    if (snapshot.isDragging) {
                        return ReactDOM.createPortal(component, document.body);
                    }
                    return component;
                }}
            </Draggable>
            {/* Modal for Creating/Editing Tasks */}
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitModal} // Unified submit handler for create
                onUpdate={handleSubmitModal} // Unified submit handler for update (logic inside decides)
                listId={list.id}
                taskToEdit={editingTask} // Pass the task to edit (null if creating)
            />
        </>
    );
};

export default ListColumn;

