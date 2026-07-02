import { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';

const roleLabels = { administrateur: 'Administrateur', agent: 'Agent', comite: 'Comité' };
const roleBadges = {
    administrateur: { bg: 'bg-purple-100', text: 'text-purple-700' },
    agent: { bg: 'bg-blue-100', text: 'text-blue-700' },
    comite: { bg: 'bg-green-100', text: 'text-green-700' },
};

function roleLabel(r) { return roleLabels[r] ?? r; }
function roleBadge(r) { return roleBadges[r] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }; }
function initials(name) { return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase(); }

export default function UtilisateursIndex({ users = [], roles = [] }) {
    const { props: pageProps } = usePage();
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [toDelete, setToDelete] = useState(null);

    const filtered = users.filter((u) => {
        const matchSearch = !search ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = !filterRole || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const deleteForm = useForm({});
    function confirmDelete(u) { setToDelete(u); }
    function doDelete() {
        deleteForm.delete(`/utilisateurs/${toDelete.id}`, {
            onSuccess: () => setToDelete(null),
        });
    }

    return (
        <AppLayout title="Utilisateurs">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des comptes</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{users.length} compte(s) enregistré(s)</p>
                </div>
                <Link
                    href="/utilisateurs/create"
                    className="flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Nouveau compte
                </Link>
            </div>

            {/* Flash messages */}
            {pageProps.flash?.success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm text-green-700">{pageProps.flash.success}</span>
                </div>
            )}
            {pageProps.flash?.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm text-red-700">{pageProps.flash.error}</span>
                </div>
            )}

            {/* Filtre / Recherche */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 px-4 py-3 flex items-center gap-3">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                />
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]">
                    <option value="">Tous les rôles</option>
                    {roles.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium uppercase tracking-wide">
                            <th className="text-left px-5 py-3">Nom</th>
                            <th className="text-left px-4 py-3">Email</th>
                            <th className="text-left px-4 py-3">Rôle</th>
                            <th className="text-left px-4 py-3">Créé le</th>
                            <th className="text-right px-5 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Aucun compte trouvé.</td>
                            </tr>
                        )}
                        {filtered.map((u) => (
                            <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#1B3A2D] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                            {initials(u.name)}
                                        </div>
                                        <span className="font-medium text-gray-800">{u.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3.5 text-gray-600">{u.email}</td>
                                <td className="px-4 py-3.5">
                                    <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', roleBadge(u.role).bg, roleBadge(u.role).text].join(' ')}>
                                        {roleLabel(u.role)}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-gray-500">{u.created_at}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/utilisateurs/${u.id}/edit`}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B3A2D] hover:bg-gray-100 transition-colors"
                                            title="Modifier"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                            </svg>
                                        </Link>
                                        {u.id !== pageProps.auth.user.id && (
                                            <button
                                                onClick={() => confirmDelete(u)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Supprimer"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal confirmation suppression */}
            {toDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 text-center mb-1">Supprimer ce compte ?</h3>
                        <p className="text-sm text-gray-500 text-center mb-5">
                            Le compte de <strong>{toDelete.name}</strong> sera définitivement supprimé.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setToDelete(null)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                Annuler
                            </button>
                            <button onClick={doDelete} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
