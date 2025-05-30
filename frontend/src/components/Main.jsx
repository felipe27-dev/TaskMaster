// src/components/Main.jsx (Modified for fetchWithAuth)
import React, { useState, useEffect, useCallback } from 'react';
import meuIcone from '../assets/taskmaster_logo_symbol-nobg.png'; // Assuming this is used somewhere, keeping it
import TaskBoard from '../components/TaskBoard';
import FilterBar from './FilterBar';
import { fetchWithAuth } from '../utils/fetchWIthAuth'; // <-- Import the new function

// --- Constants ---
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'; // No longer needed here
// console.log("API URL:", API_URL); // No longer needed here

const initialRegularListsData = [
    { id: `list-initreg-${Date.now().toString()}-1`, title: 'Tarefas Iniciais' }
];
const initialPinnedListsData = [];

// --- Helper Functions ---

// Function to apply the default sorting logic (PRIORITY FIX)
const applyDefaultSort = (tasks) => {
    if (!Array.isArray(tasks)) return [];

    const getPriorityValue = (priority) => {
        if (!priority) return 0;
        const lowerPriority = String(priority).toLowerCase();
        if (lowerPriority === 'alta') return 3;
        if (lowerPriority === 'normal' || lowerPriority === 'média' || lowerPriority === 'media') return 2;
        if (lowerPriority === 'baixa') return 1;
        return 0;
    };


    const getDateValue = (dateString) => {
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? Infinity : date.getTime();
        } catch (e) {
            return Infinity;
        }
    };

    return [...tasks].sort((a, b) => {
        const aIsDone = a.status === 'Done';
        const bIsDone = b.status === 'Done';
        if (aIsDone !== bIsDone) {
            return aIsDone ? 1 : -1;
        }
        if (!aIsDone) {
            const priorityA = getPriorityValue(a.priority);
            const priorityB = getPriorityValue(b.priority);
            if (priorityB !== priorityA) {
                return priorityB - priorityA;
            }
            const dateA = getDateValue(a.delivery_date);
            const dateB = getDateValue(b.delivery_date);
            if (dateA !== dateB) {
                return dateA - dateB;
            }
        }
        return (a.id ?? 0) - (b.id ?? 0); // Fallback sort by ID
    });
};


export default function Main({ sidebarCollapsed }) {
    // --- State Management ---
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({ status: null, priority: null, delivery_date: null });
    const [activeSort, setActiveSort] = useState('default');
    const [regularLists, setRegularLists] = useState(() => {
        const savedRegular = localStorage.getItem('taskMasterRegularLists');
        if (savedRegular && savedRegular !== "undefined") {
            try { const parsed = JSON.parse(savedRegular); return Array.isArray(parsed) ? parsed : initialRegularListsData; }
            catch (error) { console.error("Main: Erro localStorage regularLists:", error); return initialRegularListsData; }
        }
        return initialRegularListsData;
    });
    const [pinnedLists, setPinnedLists] = useState(() => {
        const savedPinned = localStorage.getItem('taskMasterPinnedLists');
        if (savedPinned && savedPinned !== "undefined") {
            try { const parsed = JSON.parse(savedPinned); return Array.isArray(parsed) ? parsed : initialPinnedListsData; }
            catch (error) { console.error("Main: Erro localStorage pinnedLists:", error); return initialPinnedListsData; }
        }
        return initialPinnedListsData;
    });
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Effects ---
    useEffect(() => {
        const saveLists = (lists) => (Array.isArray(lists) ? lists.map(({ id, title }) => ({ id, title })) : []);
        localStorage.setItem('taskMasterRegularLists', JSON.stringify(saveLists(regularLists)));
        localStorage.setItem('taskMasterPinnedLists', JSON.stringify(saveLists(pinnedLists)));
        console.log('%cMain: useEffect - List structure saved', 'color: green; font-weight: bold;');
    }, [regularLists, pinnedLists]);

    // Updated buildFetchUrl to return only the endpoint and query string
    const buildFetchEndpoint = useCallback(() => {
        const params = new URLSearchParams();
        if (searchTerm && searchTerm.trim() !== '') params.append('search', searchTerm.trim());
        if (activeFilters.status) params.append('status', activeFilters.status);
        if (activeFilters.priority) {
            const priorityValue = activeFilters.priority === "Média" ? 'normal' : activeFilters.priority.toLowerCase();
            params.append('priority', priorityValue);
        }
        if (activeFilters.delivery_date) params.append('delivery_date', activeFilters.delivery_date);
        if (activeSort && activeSort !== 'default') {
            params.append('sort_by', activeSort);
        }
        const queryString = params.toString();
        return queryString ? `/tasks?${queryString}` : `/tasks`; // Return only endpoint + query
    }, [searchTerm, activeFilters, activeSort]);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = buildFetchEndpoint(); // Get the endpoint
            console.log("🔍 Main: Fetching tasks with endpoint:", endpoint);
            // Use fetchWithAuth
            const data = await fetchWithAuth(endpoint); // GET is the default, no options needed

            let fetchedTasks = Array.isArray(data) ? data : [];
            console.log(`✅ Main: ${fetchedTasks.length} tasks fetched`);

            if (activeSort === 'default') {
                console.log("Applying default client-side sort (with priority fix)...");
                fetchedTasks = applyDefaultSort(fetchedTasks);
            } else {
                 console.log(`Using backend sort: ${activeSort}`);
            }
            setTasks(fetchedTasks);
        } catch (e) {
            console.error("Main: Failed to fetch tasks:", e);
            // Check if the error is from authentication
            if (e.message === 'Authentication failed') {
                setError("Sessão expirada ou inválida. Faça login novamente.");
                // The redirection logic should have been triggered in fetchWithAuth
            } else {
                setError("Falha ao carregar tarefas.");
            }
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [buildFetchEndpoint, activeSort]); // Updated dependency

    useEffect(() => {
        console.log("Main Effect: Fetching tasks...");
        fetchTasks();
    }, [fetchTasks]);

    // --- FilterBar Handlers ---
    const handleSearchTermChange = (term) => setSearchTerm(term);
    const handleStatusFilterClick = () => {
        const currentStatus = activeFilters.status;
        let nextStatus = null;
        if (currentStatus === null) nextStatus = 'To Do';
        else if (currentStatus === 'To Do') nextStatus = 'Done';
        setActiveFilters(prev => ({ ...prev, status: nextStatus }));
    };
    const handlePriorityFilterClick = () => {
        const currentPriority = activeFilters.priority;
        let nextPriority = null;
        if (currentPriority === null) nextPriority = 'Baixa';
        else if (currentPriority === 'Baixa') nextPriority = 'Normal'; // Use 'Normal' for cycling
        else if (currentPriority === 'Normal') nextPriority = 'Alta';
        setActiveFilters(prev => ({ ...prev, priority: nextPriority }));
    };
    const handleDateFilterChange = (dateString) => setActiveFilters(prev => ({ ...prev, delivery_date: dateString }));
    const handleSortChange = (sortValue) => setActiveSort(sortValue);
    const handleClearFilter = (filterType) => setActiveFilters(prev => ({ ...prev, [filterType]: null }));
    const handleClearAllFilters = () => {
        setSearchTerm('');
        setActiveFilters({ status: null, priority: null, delivery_date: null });
        setActiveSort('default');
    };

    // --- List Handlers ---
    const handleAddList = (listTitle) => {
        if (!listTitle.trim()) return;
        const normalizedTitle = listTitle.trim();
        const allLists = [...pinnedLists, ...regularLists];
        if (allLists.some(list => list.title === normalizedTitle)) {
            alert(`Lista "${normalizedTitle}" já existe.`);
            return;
        }
        const newList = { id: `list-${Date.now().toString()}`, title: normalizedTitle };
        setRegularLists(prev => [...(Array.isArray(prev) ? prev : []), newList]);
    };
    const handleDeleteList = (listId) => {
        const listToDelete = [...regularLists, ...pinnedLists].find(l => l.id === listId);
        const listTitleToDelete = listToDelete?.title;
        setRegularLists(prev => (Array.isArray(prev) ? prev : []).filter(list => list.id !== listId));
        setPinnedLists(prev => (Array.isArray(prev) ? prev : []).filter(list => list.id !== listId));
        if (listTitleToDelete) {
             setTasks(prevTasks => prevTasks.filter(task => task.list_title !== listTitleToDelete));
        }
    };

    // --- Task Handlers (Adapted) ---
    const handleAddCard = async (listId, taskData) => {
        const list = [...pinnedLists, ...regularLists].find(l => l.id === listId);
        if (!list) { setError("Erro: Lista não encontrada."); return; }
        const listTitle = list.title;
        if (!taskData || !taskData.title || !taskData.title.trim()) { setError("Erro: Título vazio."); return; }
        const newTaskData = { ...taskData, list_title: listTitle, status: taskData.status || 'To Do' };
        setError(null);
        try {
            // Use fetchWithAuth for POST
            await fetchWithAuth('/tasks', {
                method: 'POST',
                // Headers ('Content-Type', 'Authorization') are added automatically by fetchWithAuth
                body: JSON.stringify(newTaskData),
            });
            fetchTasks(); // Refetch to get updated list with sorting
        } catch (e) {
            console.error("Main: Failed to create task:", e);
            setError(e.message === 'Authentication failed' ? "Sessão expirada. Faça login novamente." : "Falha ao criar tarefa.");
        }
    };

    const handleDeleteCard = async (listId, cardId) => {
        const taskId = parseInt(String(cardId).replace('card-', ''), 10);
        if (isNaN(taskId)) {
            console.error("Main: Invalid cardId for deletion:", cardId);
            setError("Erro interno ao tentar deletar tarefa (ID inválido).");
            return;
        }
        const originalTasks = tasks;
        // Optimistic UI update
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        setError(null);
        try {
            // Use fetchWithAuth for DELETE
            await fetchWithAuth(`/tasks/${taskId}`, { method: 'DELETE' });
            // fetchWithAuth returns null on successful 204 (DELETE success without body)
            console.log(`Main: Task ${taskId} deleted successfully.`);
        } catch (e) {
            // Ignore 404 (Not Found) error if the task was already deleted
            if (e.message?.includes('status: 404')) {
                console.warn(`Main: Task ${taskId} not found for deletion, likely already deleted.`);
                // UI is already updated, so just return
                return;
            }
            console.error("Main: Failed to delete task:", e);
            setError(e.message === 'Authentication failed' ? "Sessão expirada. Faça login novamente." : "Falha ao deletar tarefa.");
            setTasks(originalTasks); // Revert UI update on error
        }
    };

    const handleUpdateTask = async (taskId, updatedData) => {
         if (isNaN(taskId)) {
            console.error("Main: Invalid taskId for update:", taskId);
            setError("Erro interno ao tentar atualizar tarefa (ID inválido).");
            return null;
        }
        const originalTasks = tasks;
        // Optimistic UI update (optional, but improves UX)
        setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? { ...task, ...updatedData } : task));
        setError(null);
        try {
            console.log(`Main: Updating task ${taskId} with data:`, updatedData);
            // Use fetchWithAuth for PUT
            const updatedTask = await fetchWithAuth(`/tasks/${taskId}`, {
                method: 'PUT',
                body: JSON.stringify(updatedData),
            });
            // Refetch to ensure consistency and sorting, or use updatedTask if API returns the updated object
            fetchTasks();
            console.log(`Main: Task ${taskId} updated successfully.`);
            return updatedTask; // Return the updated task (if API returns it)
        } catch (e) {
            console.error("Main: Failed to update task:", e);
            setError(e.message === 'Authentication failed' ? "Sessão expirada. Faça login novamente." : "Falha ao atualizar tarefa.");
            setTasks(originalTasks); // Revert UI update on error
            return null;
        }
    };

    const handleUpdateTaskStatus = (listId, cardId, newStatus) => {
        const taskId = parseInt(String(cardId).replace('card-', ''), 10);
        if (!isNaN(taskId)) {
            handleUpdateTask(taskId, { status: newStatus });
        } else {
             console.error("Main: Invalid cardId for status update:", cardId);
             setError("Erro interno ao tentar atualizar status (ID inválido).");
        }
    };

    const deleteCompletedTasks = async () => {
        if (window.confirm('Tem certeza que deseja excluir todas as tarefas concluídas?')) {
            const originalTasks = tasks;
            const tasksToDelete = tasks.filter(task => task.status === 'Done');
            if (tasksToDelete.length === 0) {
                alert("Nenhuma tarefa concluída para excluir.");
                return;
            }

            // Optimistic UI update: Remove completed tasks immediately
            setTasks(tasks.filter(task => task.status !== 'Done'));
            setError(null);

            try {
                // Use fetchWithAuth for the bulk delete endpoint
                await fetchWithAuth('/tasks/completed', { method: 'DELETE' });
                alert(`${tasksToDelete.length} tarefas concluídas foram excluídas com sucesso.`);
            } catch (err) {
                 // Ignore 404 (Not Found) error if there were no completed tasks on the backend
                if (err.message?.includes('status: 404')) {
                    console.warn('Main: No completed tasks found on backend for deletion.');
                    alert('Nenhuma tarefa concluída encontrada no servidor.');
                    // May need to re-sync if UI was updated optimistically
                    fetchTasks();
                    return;
                }
                console.error('Main: Erro ao excluir tarefas concluídas:', err);
                setError(err.message === 'Authentication failed' ? "Sessão expirada. Faça login novamente." : 'Erro ao excluir tarefas concluídas. Revertendo.');
                setTasks(originalTasks); // Revert UI update on error
                alert(`Erro ao excluir: ${err.message}`);
            }
        }
    };

    // --- Drag and Drop Handler ---
    const handleDragEnd = (result) => {
        const { source, destination, type, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

        if (type === 'COLUMN') {
            // ... (List reordering logic - no API calls here, just state updates) ...
             let currentPinned = Array.isArray(pinnedLists) ? [...pinnedLists] : [];
            let currentRegular = Array.isArray(regularLists) ? [...regularLists] : [];
            let movedList;
            const sourceIsPinned = source.droppableId === 'pinned-lists-area';
            const destinationIsPinned = destination.droppableId === 'pinned-lists-area';
            if (sourceIsPinned) { [movedList] = currentPinned.splice(source.index, 1); }
            else { [movedList] = currentRegular.splice(source.index, 1); }
            if (!movedList) return;
            if (destinationIsPinned) {
                if (currentPinned.length >= 3 && !sourceIsPinned) {
                    // Prevent adding more than 3 pinned lists if source was regular
                    if (!sourceIsPinned) currentRegular.splice(source.index, 0, movedList); // Put it back
                     alert("Você pode fixar no máximo 3 listas."); // Inform user
                    return;
                }
                currentPinned.splice(destination.index, 0, movedList);
                setPinnedLists(currentPinned);
                if (!sourceIsPinned) setRegularLists(currentRegular); // Update regular if moved from there
            } else {
                currentRegular.splice(destination.index, 0, movedList);
                setRegularLists(currentRegular);
                if (sourceIsPinned) setPinnedLists(currentPinned); // Update pinned if moved from there
            }
            return; // End COLUMN handling
        }

        if (type === 'CARD') {
            const taskId = parseInt(draggableId.replace('card-', ''), 10);
             if (isNaN(taskId)) {
                console.error("Main: Invalid draggableId for card drag:", draggableId);
                return; // Ignore invalid ID
            }
            const task = tasks.find(t => t.id === taskId);
            if (!task) return; // Task not found

            const sourceList = [...pinnedLists, ...regularLists].find(l => l.id === source.droppableId);
            const destinationList = [...pinnedLists, ...regularLists].find(l => l.id === destination.droppableId);
            if (!sourceList || !destinationList) return; // List not found

            // Only call API if the list actually changed
            if (source.droppableId !== destination.droppableId) {
                console.log(`Main: Moving task ${taskId} from list "${sourceList.title}" to "${destinationList.title}"`);
                // Call the already adapted handleUpdateTask
                handleUpdateTask(taskId, { list_title: destinationList.title });
                // Note: handleUpdateTask already handles optimistic update and refetching
            } else {
                 console.log(`Main: Task ${taskId} reordered within list "${sourceList.title}"`);
                 // Optional: If you need to save the order within the list, you'd need an API endpoint for that.
                 // Currently, only list change triggers an API call.
            }
        }
    };

    return (
        <div className={`flex flex-col bg-slate-900 w-full relative min-h-screen py-8 px-4 md:px-8 transition-all duration-300 ease-in-out ${!sidebarCollapsed ? 'md:pl-24' : 'md:pl-72'}`}>
             {/* Filter Bar */}
            <FilterBar
                searchTerm={searchTerm}
                onSearchTermChange={handleSearchTermChange}
                activeFilters={activeFilters}
                onStatusFilterClick={handleStatusFilterClick}
                onPriorityFilterClick={handlePriorityFilterClick}
                onDateFilterChange={handleDateFilterChange}
                activeSort={activeSort}
                onSortChange={handleSortChange}
                onClearFilter={handleClearFilter}
                onClearAllFilters={handleClearAllFilters}
                onDeleteCompleted={deleteCompletedTasks} // Pass handler
            />

            {/* Loading and Error States */}
            {loading && <div className="text-center text-slate-400 mt-4">Carregando tarefas...</div>}
            {error && <div className="text-center text-red-500 bg-red-100 border border-red-400 rounded p-2 mt-4">{error}</div>}

            {/* Task Board */}
            {!loading && !error && (
                 <TaskBoard
                    regularLists={regularLists}
                    pinnedLists={pinnedLists}
                    tasks={tasks} // Pass the potentially sorted/filtered tasks
                    onAddCard={handleAddCard}
                    onDeleteCard={handleDeleteCard}
                    onUpdateTaskStatus={handleUpdateTaskStatus} // For status changes via dropdown
                    onUpdateTask={handleUpdateTask} // Pass for inline edits or modal updates
                    onAddList={handleAddList}
                    onDeleteList={handleDeleteList}
                    onDragEnd={handleDragEnd} // Pass the drag handler
                    activeSort={activeSort} // Pass sort state if needed by TaskBoard/
                    onDeleteCompletedTasks={deleteCompletedTasks}
                />
            )}

             {/* Fallback message if no lists exist */}
             {!loading && !error && regularLists.length === 0 && pinnedLists.length === 0 && (
                <div className="text-center text-slate-500 mt-8">
                    Nenhuma lista encontrada. Adicione uma nova lista para começar!
                </div>
            )}
        </div>
    );
}

