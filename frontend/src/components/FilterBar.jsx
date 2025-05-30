// src/components/FilterBar.jsx (Fixed Icons)
import React, { useState } from 'react';
// Corrected imports: Removed SortAscending, SortDescending, added ArrowDown
import { Search, List, ArrowUp, ArrowDown, Calendar, MoreHorizontal, X as IconX, Check } from 'react-feather';

const FilterBar = ({
    searchTerm,
    onSearchTermChange,
    activeFilters, // { status: string|null, priority: string|null, delivery_date: string|null }
    activeSort,
    onClearFilter,
    onClearAllFilters,
    onStatusFilterClick,
    onPriorityFilterClick,
    onDateFilterChange, // Changed from onClick to onChange, expects (dateString | null)
    onSortChange, // New prop for sorting, expects ('default' | 'title_asc' | 'title_desc')
    onMoreOptionsClick,
    className
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(activeFilters?.delivery_date || '');
    const [showSortOptions, setShowSortOptions] = useState(false);

    // Determine button classes based on active state
    const getFilterButtonClass = (filterType) => {
        const isActive = activeFilters && activeFilters[filterType] !== null && activeFilters[filterType] !== '';
        return `filter-button ${isActive ? 'bg-sky-700 border-sky-600 text-white' : ''}`;
    };

    const handleDateButtonClick = () => {
        setShowDatePicker(!showDatePicker);
    };

    const handleDateInputChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        if (typeof onDateFilterChange === 'function') {
            onDateFilterChange(newDate || null);
        }
    };

    const handleSortButtonClick = () => {
        setShowSortOptions(!showSortOptions);
    };

    const handleSortOptionClick = (sortValue) => {
        if (typeof onSortChange === 'function') {
            onSortChange(sortValue);
        }
        setShowSortOptions(false);
    };

    const getSortLabel = () => {
        switch (activeSort) {
            case 'title_asc': return 'Título A-Z';
            case 'title_desc': return 'Título Z-A';
            default: return 'Ordenar';
        }
    };

    return (
        <div className={`w-fit max-w-full md:max-w-5xl lg:max-w-6xl p-4 bg-slate-800 rounded-lg shadow border border-slate-700 ${className || ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-y-3 md:gap-x-4">
                {/* Search and Filters */}
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    {/* Search Input */}
                    <div className="relative min-w-[200px] sm:max-w-xs flex-auto sm:flex-grow-0">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar tarefas..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-md bg-slate-700 text-gray-200 border border-slate-600 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-500"
                        />
                    </div>

                    {/* Status Filter Button */}
                    <button
                        onClick={onStatusFilterClick}
                        className={getFilterButtonClass('status')}
                    >
                        <List size={16} className="mr-1.5" /> Status
                        {activeFilters?.status && <span className="ml-1 text-xs">({activeFilters.status})</span>}
                    </button>

                    {/* Priority Filter Button */}
                    <button
                        onClick={onPriorityFilterClick}
                        className={getFilterButtonClass('priority')}
                    >
                        <ArrowUp size={16} className="mr-1.5" /> Prioridade
                        {activeFilters?.priority && <span className="ml-1 text-xs">({activeFilters.priority})</span>}
                    </button>

                    {/* Date Filter Button & Input */}
                    <div className="relative">
                        <button
                            onClick={handleDateButtonClick}
                            className={getFilterButtonClass('delivery_date')}
                        >
                            <Calendar size={16} className="mr-1.5" /> Data
                            {activeFilters?.delivery_date && <span className="ml-1 text-xs">({new Date(activeFilters.delivery_date + 'T00:00:00').toLocaleDateString()})</span>}
                        </button>
                        {showDatePicker && (
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateInputChange}
                                className="absolute top-full left-0 mt-1 z-10 p-2 rounded bg-slate-700 border border-slate-600 text-gray-200 focus:ring-sky-500 focus:border-sky-500 outline-none"
                                onBlur={() => setTimeout(() => setShowDatePicker(false), 150)}
                            />
                        )}
                    </div>

                    {/* Sort Button & Dropdown */}
                    <div className="relative ">
                        <button
                            onClick={handleSortButtonClick}
                            className={`filter-button  ${activeSort !== 'default' ? 'bg-purple-700 border-purple-600 text-white' : ''}`}
                        >
                            {/* Replaced SortAscending with ArrowUp */}
                            {activeSort === 'title_asc' && <ArrowUp size={16} className="mr-1.5" />}
                            {/* Replaced SortDescending with ArrowDown */}
                            {activeSort === 'title_desc' && <ArrowDown size={16} className="mr-1.5" />}
                            {activeSort === 'default' && <List size={16} className="mr-1.5" />}{/* Default Icon */}
                            {getSortLabel()}
                        </button>
                        {showSortOptions && (
                            <div className="absolute top-full left-0 mt-1 z-10 w-auto rounded-md shadow-lg bg-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
                                <button onClick={() => handleSortOptionClick('default')} className={`sort-option ${activeSort === 'default' ? 'bg-slate-600' : ''}`}>Padrão {activeSort === 'default' && <Check size={16} className="ml-auto" />}</button>
                                <button onClick={() => handleSortOptionClick('title_asc')} className={`sort-option ${activeSort === 'title_asc' ? 'bg-slate-600' : ''}`}>Título A-Z {activeSort === 'title_asc' && <Check size={16} className="ml-auto" />}</button>
                                <button onClick={() => handleSortOptionClick('title_desc')} className={`sort-option ${activeSort === 'title_desc' ? 'bg-slate-600' : ''}`}>Título Z-A {activeSort === 'title_desc' && <Check size={16} className="ml-auto" />}</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Clear All Button */}
                <div>
                    <button
                        onClick={onClearAllFilters}
                        className="filter-button-clear"
                        disabled={!searchTerm && (!activeFilters || Object.values(activeFilters).every(val => val === null || val === '')) && activeSort === 'default'}
                    >
                        <IconX size={16} className="mr-1.5" /> Limpar filtros
                    </button>
                </div>
            </div>

            {/* Active Filters Display */}
            {(activeFilters && Object.values(activeFilters).some(val => val !== null && val !== '')) && (
                <div className="flex items-center flex-wrap gap-2 text-sm pt-2 border-t border-slate-700 mt-3">
                    <span className="text-gray-400 mr-2">Filtros ativos:</span>
                    {activeFilters.priority && (
                        <span className="active-filter-pill">
                            Prioridade: {activeFilters.priority}
                            <button onClick={() => onClearFilter('priority')} className="ml-1.5 hover:text-red-300 p-0.5 rounded-full hover:bg-white/20">
                                <IconX size={12} />
                            </button>
                        </span>
                    )}
                    {activeFilters.status && (
                        <span className="active-filter-pill">
                            Status: {activeFilters.status}
                            <button onClick={() => onClearFilter('status')} className="ml-1.5 hover:text-red-300 p-0.5 rounded-full hover:bg-white/20">
                                <IconX size={12} />
                            </button>
                        </span>
                    )}
                    {activeFilters.delivery_date && (
                        <span className="active-filter-pill">
                            Data: {new Date(activeFilters.delivery_date + 'T00:00:00').toLocaleDateString()}
                            <button onClick={() => onClearFilter('delivery_date')} className="ml-1.5 hover:text-red-300 p-0.5 rounded-full hover:bg-white/20">
                                <IconX size={12} />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterBar;



