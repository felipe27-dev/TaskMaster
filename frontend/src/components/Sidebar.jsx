import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BarChart2, Settings, Home, User } from 'react-feather';
import meuIcone2 from '../assets/taskmaster_logo_monochrome_lateral_white-nobg.png';
import meuIcone3 from '../assets/taskmaster_logo_monochrome_lateral_symbol_white-nobg.png';

const Sidebar = ({ collapsed, onToggle, profileImageUrl }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isHovered || !collapsed; // Combina hover e estado fixo do botão

  return (
    <div
      className={`relative z-40 text-white transition-all duration-300 min-h-screen flex flex-col 
                  bg-gradient-to-br from-[#D8432D] via-[#7A1B5E] to-[#3F0C56]
                  ${isExpanded ? 'w-64 p-4' : 'w-[68px] items-center px-1 py-2'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${!isExpanded ? 'w-full flex flex-col items-center' : ''}`}>
        <div className={`${!isExpanded ? 'flex justify-center w-full' : 'flex justify-end'}`}>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className={`flex items-center min-w-0 mb-4 ${!isExpanded ? 'justify-center' : 'gap-2'}`}>
        {isExpanded ? (
          <img
            src={meuIcone2}
            alt="Logo"
            className={`w-[200px] h-[75px] flex-shrink-0 transition-all duration-300`}
          />
        ) : (
          <img
            src={meuIcone3}
            alt="Logo"
            className="w-10 h-10 flex-shrink-0 transition-all duration-300"
          />
        )}
        </div>

        <Link
          to="/app/profile"
          className={`flex items-center rounded-lg cursor-pointer hover:bg-white/10 transition-colors mb-4
                      ${!isExpanded ? 'w-12 h-12 p-0 justify-center' : 'p-2 gap-3'}`}
          title="Perfil do Usuário"
        >
          <div className={`flex-shrink-0 rounded-full flex items-center justify-center 
                         ${!isExpanded ? 'w-12 h-12' : 'w-8 h-8'} 
                         ${profileImageUrl ? '' : 'bg-slate-700/50'}`}>
            {profileImageUrl ? (
              <img
                className="w-full h-full rounded-full object-cover"
                src={profileImageUrl}
                alt="Avatar do usuário"
              />
            ) : (
              <User size={!isExpanded ? 24 : 22} className="text-slate-300" />
            )}
          </div>

          {isExpanded && (
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden ml-3">
              Seu perfil
            </span>
          )}
        </Link>
      </div>

      <nav className={`space-y-1 flex-grow overflow-y-auto custom-scrollbar ${!isExpanded ? 'w-full' : ''}`}>
        <SidebarItem icon={<Home size={20} />} label="Minhas tarefas" collapsed={!isExpanded} to="/app" />
        <SidebarItem icon={<BarChart2 size={20} />} label="Estatísticas" collapsed={!isExpanded} to="/app/statistics" />
        <SidebarItem icon={<Settings size={20} />} label="Configurações" collapsed={!isExpanded} to="/app/settings" />
      </nav>
    </div>
  );
};

const SidebarItem = ({ icon, label, collapsed, to = "#" }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === "/app" && (location.pathname === "/app" || location.pathname === "/app/"));

  return (
    <Link
      to={to}
      className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-300
        ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}
        ${collapsed ? 'justify-center' : 'justify-start gap-3'}`}
      title={label}
    >
      <div className={`h-6 w-6 flex items-center justify-center flex-shrink-0 ${collapsed && !isActive ? 'text-slate-300' : ''} ${collapsed && isActive ? 'text-white' : ''}`}>
        {icon}
      </div>
      {!collapsed && (
        <span className="transition-opacity duration-200 whitespace-nowrap overflow-hidden opacity-100 w-auto ml-3">
          {label}
        </span>
      )}
    </Link>
  );
};

export default Sidebar;
