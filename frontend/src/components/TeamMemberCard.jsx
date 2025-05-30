// src/components/TeamMemberCard.jsx
import React from 'react';
// CORREÇÃO AQUI: Mude 'Github' para 'GitHub'
import { GitHub, Linkedin, Instagram, Mail, MessageSquare } from 'react-feather';

const TeamMemberCard = ({ photoUrl, name, course, role, socialLinks }) => {
    const socialIconProps = { size: 22, className: "text-slate-400 hover:text-sky-400 transition-colors" };

    const getWhatsAppLink = (phone) => {
        if (!phone) return null;
        const justDigits = phone.replace(/\D/g, '');
        return `https://wa.me/${justDigits}`;
    };

    const getGmailLink = (email) => {
        if (!email) return null;
        return `mailto:${email}`;
    }

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col items-center text-center transform hover:scale-105 hover:shadow-sky-500/20 transition-all duration-300 ease-in-out min-h-[360px]">
            <img
                src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=475569&color=CBD5E1&size=128&font-size=0.33&bold=true`}
                alt={`Foto de ${name}`}
                className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-slate-600 shadow-md"
            />
            <h3 className="text-xl font-semibold text-slate-100 mb-1">{name}</h3>
            <p className="text-sky-400 text-sm mb-1 font-medium h-10 flex items-center justify-center">{role}</p>
            <p className="text-slate-400 text-xs mb-4 h-8 flex items-center justify-center">{course}</p>

            <div className="flex space-x-5 mt-auto pt-4 border-t border-slate-700 w-full justify-center">
                {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                        <Instagram {...socialIconProps} />
                    </a>
                )}
                {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                        <Linkedin {...socialIconProps} />
                    </a>
                )}
                {socialLinks.github && (
                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                        <GitHub {...socialIconProps} /> {/* << NOME CORRIGIDO */}
                    </a>
                )}
                {socialLinks.gmail && (
                    <a href={getGmailLink(socialLinks.gmail)} title="Gmail">
                        <Mail {...socialIconProps} />
                    </a>
                )}
                {socialLinks.whatsapp && (
                    <a href={getWhatsAppLink(socialLinks.whatsapp)} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                        <MessageSquare {...socialIconProps} />
                    </a>
                )}
                {!socialLinks.instagram && !socialLinks.linkedin && !socialLinks.github && !socialLinks.gmail && !socialLinks.whatsapp && (
                    <p className="text-xs text-slate-500">Redes sociais não informadas.</p>
                )}
            </div>
        </div>
    );
};

export default TeamMemberCard;