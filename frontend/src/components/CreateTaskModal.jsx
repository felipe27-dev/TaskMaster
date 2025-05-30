// src/components/CreateTaskModal.jsx (Merged for Editing)
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'react-feather';

// Added taskToEdit prop and onUpdate prop for editing functionality
const CreateTaskModal = ({ isOpen, onClose, onSubmit, onUpdate, listId, taskToEdit = null }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    // Using 'delivery_date' based on the complete version (pasted_content_2.txt)
    const [delivery_date, setDeliveryDate] = useState('');
    const [priority, setPriority] = useState('Normal');

    // Effect to populate form when editing or clear when creating
    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setTitle(taskToEdit.title || '');
                setDescription(taskToEdit.description || '');
                // Format date for input type="date" (YYYY-MM-DD)
                // Assuming taskToEdit.delivery_date is in a format that can be parsed or is already YYYY-MM-DD
                // If it's in another format (like DD/MM/YY), conversion is needed here.
                // For simplicity, assuming it's compatible or null/undefined.
                const formattedDate = taskToEdit.delivery_date ? new Date(taskToEdit.delivery_date).toISOString().split('T')[0] : '';
                setDeliveryDate(formattedDate);
                // Ensure priority matches one of the select options, default to Normal if not
                const validPriorities = ['baixa', 'normal', 'alta']; // Match options below
                const formattedPriority = taskToEdit.priority.charAt(0).toUpperCase() + taskToEdit.priority.slice(1).toLowerCase();
                setPriority(formattedPriority);
            } else {
                // Clear fields for creating a new task
                setTitle('');
                setDescription('');
                setDeliveryDate('');
                setPriority('normal');
            }
        }
    }, [isOpen, taskToEdit]); // Re-run when modal opens or taskToEdit changes

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('O título da tarefa é obrigatório.');
            return;
        }

        // Prepare task details, excluding status as it's handled elsewhere (or could be added)
        const taskDetails = {
            title: title.trim(),
            description: description.trim(),
            // Send date back in the format expected by backend (might need adjustment)
            delivery_date: delivery_date || null, // Send null if empty
            priority: priority // Capitalize first letter
            // list_title might be needed if updating list, but typically handled by drag-and-drop
        };

        if (taskToEdit) {
            // Call the update function if editing
            if (typeof onUpdate === 'function') {
                console.log('CreateTaskModal: handleSubmit (Update) chamando props.onUpdate com:', { taskId: taskToEdit.id, taskDetails });
                onUpdate(taskToEdit.id, taskDetails); // Pass task ID and updated details
            } else {
                console.error('CreateTaskModal: Erro - props.onUpdate NÃO é uma função!');
            }
        } else {
            // Call the submit (create) function if creating
            if (typeof onSubmit === 'function') {
                // Add default status for new tasks
                const newTaskDetails = { ...taskDetails, status: 'To Do' };
                console.log('CreateTaskModal: handleSubmit (Create) chamando props.onSubmit com:', { listId, newTaskDetails });
                onSubmit(listId, newTaskDetails);
            } else {
                console.error('CreateTaskModal: Erro - props.onSubmit NÃO é uma função!');
            }
        }
        onClose(); // Close modal after submit/update attempt
    };
    const handleModalContentClick = (e) => e.stopPropagation();

    const modalContent = (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md text-gray-200 border border-slate-700"
                onClick={handleModalContentClick}
            >
                <div className="flex justify-between items-center mb-6">
                    {/* Dynamic Title */}
                    <h2 className="text-2xl font-semibold">{taskToEdit ? 'Editar Tarefa' : 'Criar Tarefa'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-slate-700">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="taskTitleModal" className="block text-sm font-medium text-gray-300 mb-1">Título:</label>
                        <input type="text" id="taskTitleModal" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-sky-500 focus:ring-sky-500 outline-none" required autoFocus />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="taskDescriptionModal" className="block text-sm font-medium text-gray-300 mb-1">Descrição:</label>
                        <textarea id="taskDescriptionModal" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-sky-500 focus:ring-sky-500 outline-none"></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="taskDeliveryDateModal" className="block text-sm font-medium text-gray-300 mb-1">Data de Entrega:</label>
                        {/* Using type="date" for better UX */}
                        <input type="date" id="taskDeliveryDateModal" value={delivery_date} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-sky-500 focus:ring-sky-500 outline-none" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="taskPriorityModal" className="block text-sm font-medium text-gray-300 mb-1">Prioridade:</label>
                        {/* Ensure options match the validPriorities array */}
                        <select id="taskPriorityModal" value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:border-sky-500 focus:ring-sky-500 outline-none appearance-none">
                            <option value="Baixa">Baixa</option>
                            <option value="Normal">Normal</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                    {/* Dynamic Submit Button */}
                    <button type="submit" className={`w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-colors ${taskToEdit ? 'bg-sky-600 hover:bg-sky-500' : 'bg-red-500 hover:bg-red-600'}`}>
                        {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
                    </button>
                </form>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default CreateTaskModal;

