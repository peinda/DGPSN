import { Link } from '@inertiajs/react';
import DashboardIcon from './icons/DashboardIcon.jsx';
import FileTextIcon from './icons/FileTextIcon.jsx';
import UsersIcon from './icons/UsersIcon.jsx';
import CommitteeIcon from './icons/CommitteeIcon.jsx';
import BookIcon from './icons/BookIcon.jsx';
import ChartIcon from './icons/ChartIcon.jsx';
import UserGroupIcon from './icons/UserGroupIcon.jsx';
import SettingsIcon from './icons/SettingsIcon.jsx';

const icons = {
    dashboard: DashboardIcon,
    'file-text': FileTextIcon,
    users: UsersIcon,
    committee: CommitteeIcon,
    book: BookIcon,
    chart: ChartIcon,
    'user-group': UserGroupIcon,
    settings: SettingsIcon,
};

export default function NavItem({ href, label, icon, active, open, sub = false }) {
    const Icon = icon ? icons[icon] : null;

    return (
        <Link
            href={href}
            className={[
                'flex items-center gap-3 transition-colors duration-150 group relative',
                sub ? 'py-1.5 pr-3' : 'py-2.5 pr-3',
                open ? (sub ? 'pl-10' : 'pl-4') : 'pl-4 justify-center',
                active
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/70 hover:bg-white/5 hover:text-white',
            ].join(' ')}
        >
            {!sub && Icon && (
                <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                </span>
            )}
            {sub && open && (
                <span className={['w-1 h-1 rounded-full shrink-0', active ? 'bg-[#F5A623]' : 'bg-white/30'].join(' ')} />
            )}
            {open && <span className="text-[20px] truncate">{label}</span>}

            {active && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#F5A623] rounded-l" />
            )}

            {!open && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[20px] rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {label}
                </div>
            )}
        </Link>
    );
}
