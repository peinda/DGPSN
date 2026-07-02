import { useState } from 'react';
import FileTextIcon from './icons/FileTextIcon.jsx';
import BookIcon from './icons/BookIcon.jsx';
import ChartIcon from './icons/ChartIcon.jsx';
import UserGroupIcon from './icons/UserGroupIcon.jsx';

const icons = {
    'file-text': FileTextIcon,
    book: BookIcon,
    chart: ChartIcon,
    'user-group': UserGroupIcon,
};

export default function NavGroup({ icon, label, open, children }) {
    const [expanded, setExpanded] = useState(false);
    const Icon = icons[icon];

    function toggle() {
        if (open) setExpanded((e) => !e);
    }

    return (
        <div>
            <button
                onClick={toggle}
                className={[
                    'w-full flex items-center gap-3 py-2.5 pr-3 transition-colors duration-150',
                    open ? 'pl-4' : 'pl-4 justify-center',
                    'text-white/70 hover:bg-white/5 hover:text-white',
                ].join(' ')}
            >
                <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                </span>
                {open && <span className="text-sm truncate flex-1 text-left">{label}</span>}
                {open && (
                    <svg
                        className={['w-4 h-4 shrink-0 transition-transform', expanded ? 'rotate-180' : ''].join(' ')}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                )}
            </button>

            {expanded && open && <div>{children}</div>}
        </div>
    );
}
