import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';
import StatusBadge from '@/Components/UI/StatusBadge.jsx';

const defaultDemandes = { data: [], total: 0, last_page: 1, links: [] };

function formatDate(d) {
    return d ? new Date(d).toLocaleDateString('fr-FR') : '—';
}

export default function DemandesIndex({
    demandes = defaultDemandes,
    typesAide = [],
    annees = [],
    statuts = [],
    filters = {},
}) {
    const { props } = usePage();
    const permissions = props.auth?.user?.permissions ?? [];
    function can(p) { return permissions.includes(p); }

    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        statut: filters.statut ?? '',
        type_aide_id: filters.type_aide_id ?? '',
        annee_gestion_id: filters.annee_gestion_id ?? '',
    });

    function updateFilter(key, value) {
        setLocalFilters((f) => ({ ...f, [key]: value }));
    }

    function applyFilters(overrides = localFilters) {
        router.get(route('demandes.index'), {
            search: overrides.search || undefined,
            statut: overrides.statut || undefined,
            type_aide_id: overrides.type_aide_id || undefined,
            annee_gestion_id: overrides.annee_gestion_id || undefined,
        }, { preserveState: true, replace: true });
    }

    function resetFilters() {
        const cleared = { search: '', statut: '', type_aide_id: '', annee_gestion_id: '' };
        setLocalFilters(cleared);
        router.get(route('demandes.index'), {}, { preserveState: true, replace: true });
    }

    const hasActiveFilters =
        !!(localFilters.search || localFilters.statut || localFilters.type_aide_id || localFilters.annee_gestion_id);

    return (
        <AppLayout title="Demandes sociales">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Demandes sociales</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Suivi de toutes les demandes de prise en charge.</p>
                </div>
                {can('demandes.creer') && (
                    <Link href={route('demandes.create')}
                        className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        Nouvelle demande
                    </Link>
                )}
            </div>

            <FlashMessage />

            {/* Filtres */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-48">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                        value={localFilters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        onKeyUp={(e) => { if (e.key === 'Enter') applyFilters(); }}
                        type="text" placeholder="Référence, citoyen, CIN..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                </div>
                <select value={localFilters.statut}
                    onChange={(e) => { const v = e.target.value; updateFilter('statut', v); applyFilters({ ...localFilters, statut: v }); }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                    <option value="">Tous les statuts</option>
                    {statuts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select value={localFilters.type_aide_id}
                    onChange={(e) => { const v = e.target.value; updateFilter('type_aide_id', v); applyFilters({ ...localFilters, type_aide_id: v }); }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                    <option value="">Tous les types</option>
                    {typesAide.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
                <select value={localFilters.annee_gestion_id}
                    onChange={(e) => { const v = e.target.value; updateFilter('annee_gestion_id', v); applyFilters({ ...localFilters, annee_gestion_id: v }); }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                    <option value="">Toutes les années</option>
                    {annees.map((a) => <option key={a.id} value={a.id}>{a.annee}</option>)}
                </select>
                <button onClick={() => applyFilters()}
                    className="px-4 py-2 text-sm font-medium bg-[#1B3A2D] text-white rounded-lg hover:bg-[#254d3c] transition-colors">
                    Filtrer
                </button>
                {hasActiveFilters && (
                    <button onClick={resetFilters}
                        className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        Réinitialiser
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-3 font-medium">Référence</th>
                            <th className="text-left px-4 py-3 font-medium">Citoyen</th>
                            <th className="text-left px-4 py-3 font-medium">Type d'aide</th>
                            <th className="text-left px-4 py-3 font-medium">Événement</th>
                            <th className="text-left px-4 py-3 font-medium">Statut</th>
                            <th className="text-left px-4 py-3 font-medium">Date</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {demandes.data.map((d) => (
                            <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs text-gray-700">{d.reference ?? '—'}</td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900 text-xs">{d.citoyen?.prenom} {d.citoyen?.nom}</p>
                                    <p className="text-gray-400 text-xs">{d.citoyen?.cin}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{d.type_aide?.nom}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{d.evenement?.nom ?? '—'}</td>
                                <td className="px-4 py-3"><StatusBadge status={d.statut} /></td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.created_at)}</td>
                                <td className="px-5 py-3 text-right">
                                    <Link href={route('demandes.show', d.id)} className="text-xs text-blue-600 hover:underline font-medium">Détail</Link>
                                </td>
                            </tr>
                        ))}
                        {!demandes.data?.length && (
                            <tr>
                                <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">Aucune demande trouvée.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {demandes.last_page > 1 && (
                    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">{demandes.total} demande(s)</p>
                        <div className="flex gap-1">
                            {demandes.links.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.url ?? ''}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={[
                                        link.active ? 'bg-[#1B3A2D] text-white' : 'text-gray-600 hover:bg-gray-100',
                                        !link.url ? 'opacity-40 pointer-events-none' : '',
                                        'px-3 py-1.5 text-xs rounded-lg transition-colors',
                                    ].join(' ')}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
