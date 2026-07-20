import { useEffect, useRef, useState } from 'react';
import { usePage, useForm, Link, router } from '@inertiajs/react';
import NavItem from '@/Components/UI/NavItem.jsx';
import NavGroup from '@/Components/UI/NavGroup.jsx';

export default function AppLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const userMenuRef = useRef(null);
    const notifRef = useRef(null);
    const { props, url } = usePage();

    const userName = props.auth?.user?.name ?? 'Utilisateur';
    const userEmail = props.auth?.user?.email ?? '';
    const userRole = (() => {
        const role = props.auth?.user?.role;
        const labels = { administrateur: 'Administrateur', agent: 'Agent', comite: 'Comité' };
        return labels[role] ?? 'Utilisateur';
    })();
    const userInitials = userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    const permissions = props.auth?.user?.permissions ?? [];
    const notifCount = props.auth?.notifications_count ?? 0;
    const notifications = props.auth?.notifications ?? [];

    function can(permission) {
        return permissions.includes(permission);
    }

    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date());

    function isActive(path) {
        return url.startsWith(path);
    }

    const logoutForm = useForm({});
    function logout() {
        logoutForm.post('/logout');
    }

    function ouvrirNotif(n) {
        router.post(route('notifications.lire-une', n.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setNotifOpen(false);
                if (n.demande_id) router.visit(route('demandes.show', n.demande_id));
            },
        });
    }

    function touLire() {
        router.post(route('notifications.lire'), {}, { preserveScroll: true });
        setNotifOpen(false);
    }

    useEffect(() => {
        function onClickOutside(e) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('click', onClickOutside);
        return () => document.removeEventListener('click', onClickOutside);
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={[
                    'flex flex-col transition-all duration-300 shrink-0',
                    sidebarOpen ? 'w-64' : 'w-16',
                    'bg-[#1B3A2D] text-white',
                ].join(' ')}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 min-h-[64px]">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-white overflow-hidden flex items-center justify-center p-0.5">
                        <img src="/images/logo.png" alt="Logo DGPSN" className="w-full h-full object-contain" />
                    </div>
                    {sidebarOpen && (
                        <div className="overflow-hidden">
                            <p className="text-[20px] font-bold leading-tight whitespace-nowrap">DGPSN</p>
                            <p className="text-[20px] text-white/60 whitespace-nowrap">Plateforme de Gestion Sociale</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                    <NavItem open={sidebarOpen} href="/dashboard" icon="dashboard" label="Tableau de bord" active={isActive('/dashboard')} />

                    {can('demandes.voir') && (
                        <NavGroup open={sidebarOpen} icon="file-text" label="Demandes sociales">
                            <NavItem open={sidebarOpen} href="/demandes" label="Toutes les demandes" active={isActive('/demandes')} sub />
                            {can('demandes.creer') && (
                                <NavItem open={sidebarOpen} href="/demandes/create" label="Nouvelle demande" active={isActive('/demandes/create')} sub />
                            )}
                        </NavGroup>
                    )}

                    {can('citoyens.voir') && (
                        <NavItem open={sidebarOpen} href="/citoyens" icon="users" label="Citoyens" active={isActive('/citoyens')} />
                    )}

                    {can('demandes.deliberer') && (
                        <NavItem open={sidebarOpen} href="/comite" icon="committee" label="Comité de délibération" active={isActive('/comite')} />
                    )}

                    {can('referentiels.gerer') && (
                        <NavGroup open={sidebarOpen} icon="book" label="Référentiels">
                            <NavItem open={sidebarOpen} href="/referentiels/types-aide" label="Types d'aide" active={isActive('/referentiels/types-aide')} sub />
                            <NavItem open={sidebarOpen} href="/referentiels/prestataires" label="Prestataires" active={isActive('/referentiels/prestataires')} sub />
                            <NavItem open={sidebarOpen} href="/referentiels/evenements" label="Événements" active={isActive('/referentiels/evenements')} sub />
                            <NavItem open={sidebarOpen} href="/referentiels/periodes" label="Périodes d'ouverture" active={isActive('/referentiels/periodes')} sub />
                            <NavItem open={sidebarOpen} href="/referentiels/annees" label="Années de gestion" active={isActive('/referentiels/annees')} sub />
                        </NavGroup>
                    )}

                    {can('rapports.voir') && (
                        <NavGroup open={sidebarOpen} icon="chart" label="Rapports & Statistiques">
                            <NavItem open={sidebarOpen} href="/rapports/tableau-de-bord" label="Vue d'ensemble" active={isActive('/rapports/tableau-de-bord')} sub />
                            {can('rapports.exporter') && (
                                <NavItem open={sidebarOpen} href="/rapports/exports" label="Exports" active={isActive('/rapports/exports')} sub />
                            )}
                        </NavGroup>
                    )}

                    {can('utilisateurs.gerer') && (
                        <NavGroup open={sidebarOpen} icon="user-group" label="Utilisateurs">
                            <NavItem open={sidebarOpen} href="/utilisateurs" label="Liste des agents" active={isActive('/utilisateurs')} sub />
                            <NavItem open={sidebarOpen} href="/utilisateurs/create" label="Ajouter un agent" active={isActive('/utilisateurs/create')} sub />
                        </NavGroup>
                    )}

                    <NavItem open={sidebarOpen} href="/parametres" icon="settings" label="Paramètres" active={isActive('/parametres')} />
                </nav>

                {/* Role badge */}
                <div className="px-4 py-3 border-t border-white/10">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#F5A623]/20 flex items-center justify-center shrink-0">
                                <svg className="w-3.5 h-3.5 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[20px] text-white/50">Rôle actuel</p>
                                <p className="text-[20px] font-semibold text-white">{userRole}</p>
                            </div>
                        </div>
                    )}
                    {!sidebarOpen && (
                        <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Date */}
                        <span className="hidden md:flex items-center gap-1.5 text-[20px] text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            {formattedDate}
                        </span>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setNotifOpen(!notifOpen)}
                                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                                </svg>
                                {notifCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {notifCount > 9 ? '9+' : notifCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown notifications */}
                            {notifOpen && (
                                <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <p className="text-[20px] font-semibold text-gray-800">Notifications</p>
                                        {notifications.length > 0 && (
                                            <button onClick={touLire}
                                                className="text-[20px] text-[#1B3A2D] hover:underline font-medium">
                                                Tout marquer comme lu
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {!notifications.length && (
                                            <div className="px-4 py-8 text-center text-[20px] text-gray-400">
                                                Aucune nouvelle notification.
                                            </div>
                                        )}
                                        {notifications.map((n) => (
                                            <div key={n.id}
                                                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer"
                                                onClick={() => ouvrirNotif(n)}>
                                                <div className={[
                                                    'mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                                                    n.statut === 'approuve' ? 'bg-green-100' : 'bg-red-100',
                                                ].join(' ')}>
                                                    {n.statut === 'approuve' ? (
                                                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[20px] text-gray-800 leading-snug">{n.message}</p>
                                                    <p className="text-[20px] text-gray-400 mt-0.5">{n.created_at}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2.5 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#1B3A2D] text-white flex items-center justify-center text-[20px] font-bold shrink-0">
                                    {userInitials}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-[20px] font-semibold text-gray-800 leading-tight">{userName}</p>
                                    <p className="text-[20px] text-gray-500">{userRole}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>

                            {/* Dropdown */}
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-[20px] font-semibold text-gray-800 truncate">{userName}</p>
                                        <p className="text-[20px] text-gray-500 truncate">{userEmail}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/parametres"
                                            className="flex items-center gap-2.5 px-4 py-2 text-[20px] text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                            Mon profil
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-100 py-1">
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-2.5 w-full px-4 py-2 text-[20px] text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                            </svg>
                                            Se déconnecter
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
