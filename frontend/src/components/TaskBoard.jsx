// src/components/TaskBoard.jsx (Simplified Presentational Component)
import React, { useState, useEffect } from 'react'; // Removed useCallback as fetch logic is gone
import AddList from './AddList';
import ListColumn from './ListColumn'; // Assuming ListColumn_merged.jsx is renamed
import PinnedListsArea from './PinnedListsArea';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Trash2 } from 'react-feather';

// --- Constants ---
// API_URL is no longer needed here, managed by Main
const PINNED_AREA_HEADER_HEIGHT_APPROX = 60;
const PINNED_AREA_COLLAPSED_RESERVED_HEIGHT_FOR_PADDING = PINNED_AREA_HEADER_HEIGHT_APPROX + 24;

// Simplified TaskBoard receives all data and handlers as props
export default function TaskBoard({
    // State passed from Main
    tasks,
    loading,
    error,
    regularLists,
    pinnedLists,
    sidebarCollapsed,
    // Handlers passed from Main
    onAddList,
    onDeleteList,
    onAddCard,
    onDeleteCard,
    onUpdateTask,
    onUpdateTaskStatus,
    onDeleteCompletedTasks,
    onDragEndCallback // Renamed prop for clarity
}) {

    // --- Local UI State ---
    const [isPinnedAreaCollapsed, setIsPinnedAreaCollapsed] = useState(true);

    // --- Derived State ---
    // Calculate hasCompletedTasks based on passed tasks prop
    const hasCompletedTasks = Array.isArray(tasks) && tasks.some(task => task.status === 'Done');

    // --- Local UI Handlers ---
    const togglePinnedAreaCollapse = () => {
        setIsPinnedAreaCollapsed(prevState => !prevState);
    };

    // --- Filtering/Mapping Logic (Applied to props) ---
    // Maps tasks to the list structures received via props
    const getFilteredAndMappedLists = (listStructures, allTasks) => {
        // Ensure listStructures and allTasks are arrays before mapping/filtering
        const safeListStructures = Array.isArray(listStructures) ? listStructures : [];
        const safeTasks = Array.isArray(allTasks) ? allTasks : [];
        
        return safeListStructures.map(list => ({
            ...list,
            // Filter tasks belonging to the current list title
            cards: safeTasks.filter(task => task.list_title === list.title)
        }));
    };

    const mappedRegularLists = getFilteredAndMappedLists(regularLists, tasks);
    const mappedPinnedLists = getFilteredAndMappedLists(pinnedLists, tasks);

    const mainBoardPaddingBottom = `${PINNED_AREA_COLLAPSED_RESERVED_HEIGHT_FOR_PADDING}px`;

    // --- Render Logic ---
    if (loading) {
        return <div className="text-center text-gray-400 p-10">Carregando tarefas...</div>;
    }

    if (error) {
        return <div className="text-center text-red-400 p-10">Erro: {error}</div>;
    }

    return (
        // Removed outer flex container, assuming Main provides layout
        <div className="flex-grow overflow-hidden h-full -ml-4"> {/* Ensure TaskBoard fills available space */}
            <DragDropContext onDragEnd={onDragEndCallback}> {/* Use the passed callback */}
                {/* Pinned Lists Area */}
                {/*<PinnedListsArea
                    pinnedLists={mappedPinnedLists}
                    listProps={{
                        // Pass handlers down
                        onDeleteList: onDeleteList,
                        onAddCard: onAddCard,
                        onDeleteCard: onDeleteCard,
                        onUpdateTaskStatus: onUpdateTaskStatus,
                        onUpdateCard: onUpdateTask, // Pass the general update task handler
                        isPinnedContext: true
                    }}
                    sidebarCollapsed={sidebarCollapsed}
                    isCollapsed={isPinnedAreaCollapsed}
                    onToggleCollapse={togglePinnedAreaCollapse}
                />*/}
                {/* Main Board Droppable Area */}
                <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            // Adjusted styling for better layout within Main
                            className="flex space-x-4 p-4 overflow-x-auto h-[calc(100%-var(--pinned-area-height,0px))] items-start"
                            style={{ '--pinned-area-height': isPinnedAreaCollapsed ? `${PINNED_AREA_COLLAPSED_RESERVED_HEIGHT_FOR_PADDING}px` : `${PINNED_AREA_HEADER_HEIGHT_APPROX + 190 + 32}px` /* Approximate expanded height */ }}
                        >
                            {/* Regular Lists Columns */}
                            {(Array.isArray(mappedRegularLists) ? mappedRegularLists : []).map((list, index) => (
                                <ListColumn
                                    key={list.id}
                                    list={list}
                                    index={index}
                                    // Pass handlers down
                                    onDeleteList={onDeleteList}
                                    onAddCard={onAddCard}
                                    onDeleteCard={onDeleteCard}
                                    onUpdateTaskStatus={onUpdateTaskStatus}
                                    onUpdateCard={onUpdateTask} // Pass the general update task handler
                                    isPinnedContext={false}
                                />
                            ))}
                            {provided.placeholder}
                            {/* Add List Component */}
                            <div className="flex-shrink-0 w-72 self-start">
                                <AddList getlist={onAddList} /> {/* Use passed handler */}
                            </div>
                        </div>
                    )}
                </Droppable>
                {/* Delete Completed Tasks Button */}
                {hasCompletedTasks && (
                    <div className="fixed bottom-20 right-2 z-40">
                        <button
                            onClick={onDeleteCompletedTasks} // Use passed handler
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center transition-colors duration-200"
                            title="Excluir todas as tarefas concluídas"
                        >
                            <Trash2 size={18} className="mr-2" />
                            Excluir Concluídas
                        </button>
                    </div>
                )}
            </DragDropContext>
        </div>
    );
}

