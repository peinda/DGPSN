import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';

const defaultCitoyens = { data: [], total: 0, last_page: 1, links: [] };

export default function CitoyensIndex({ citoyens = defaultCitoyens, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applySearch() {
        router.get(route('citoyens.index'), { search: search || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout title="Citoyens">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Citoyens bénéficiaires</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Base des citoyens enregistrés dans le système.</p>
                </div>
                <Link href={route('demandes.create')} className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Nouvelle demande
                </Link>
            </div>

            <FlashMessage />

            {/* Recherche */}
            <div className="mb-5 flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyUp={(e) => { if (e.key === 'Enter') applySearch(); }}
                        type="text" placeholder="Nom, prénom ou CIN..."
                        className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                    {search && (
                        <button onClick={() => { setSearch(''); router.get(route('citoyens.index'), {}, { preserveState: true, replace: true }); }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    )}
                </div>
                <button onClick={applySearch} className="px-4 py-2 text-sm font-medium bg-[#1B3A2D] text-white hover:bg-[#254d3c] rounded-lg transition-colors">Rechercher</button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-3 font-medium">CIN</th>
                            <th className="text-left px-4 py-3 font-medium">Nom complet</th>
                            <th className="text-left px-4 py-3 font-medium">Téléphone</th>
                            <th className="text-left px-4 py-3 font-medium">Localité</th>
                            <th className="text-right px-4 py-3 font-medium">Demandes</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citoyens.data.map((c) => (
                            <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs text-gray-600">{c.cin}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{c.prenom} {c.nom}</td>
                                <td className="px-4 py-3 text-gray-600">{c.telephone ?? '—'}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{c.commune?.nom ?? '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={[
                                        'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
                                        c.demandes_count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
                                    ].join(' ')}>
                                        {c.demandes_count}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <Link href={route('citoyens.show', c.id)} className="text-xs text-blue-600 hover:underline font-medium">Voir fiche</Link>
                                </td>
                            </tr>
                        ))}
                        {!citoyens.data?.length && (
                            <tr>
                                <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">Aucun citoyen enregistré.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {citoyens.last_page > 1 && (
                    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">{citoyens.total} citoyen(s)</p>
                        <div className="flex gap-1">
                            {citoyens.links.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.url ?? ''}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={[
                                        'px-3 py-1.5 text-xs rounded-lg transition-colors',
                                        link.active ? 'bg-[#1B3A2D] text-white' : 'text-gray-600 hover:bg-gray-100',
                                        !link.url ? 'opacity-40 pointer-events-none' : '',
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
