import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';

const COULEUR_MAP = { green: '#16a34a', blue: '#3b82f6', purple: '#9333ea', red: '#ef4444', gray: '#9ca3af', slate: '#64748b' };

export default function RapportsIndex({
    parStatut = [],
    parType = [],
    parRegion = [],
    evolution = [],
    annees = [],
    typesAide = [],
    totalGeneral = 0,
    filters = {},
}) {
    const [localFilters, setLocalFilters] = useState({
        annee_gestion_id: filters.annee_gestion_id ?? '',
        type_aide_id: filters.type_aide_id ?? '',
    });

    function applyFilters(overrides = localFilters) {
        router.get(route('rapports.index'), {
            annee_gestion_id: overrides.annee_gestion_id || undefined,
            type_aide_id: overrides.type_aide_id || undefined,
        }, { preserveState: true, replace: true });
    }

    const maxTotal = Math.max(...evolution.map((m) => m.total), 1);
    const maxType = Math.max(...parType.map((t) => t.total), 1);

    function barHeight(val) {
        return Math.max((val / maxTotal) * 100, val > 0 ? 4 : 0) + 'px';
    }

    function pct(val) {
        return Math.round((val / maxType) * 100);
    }

    function couleurStatut(couleur) {
        return COULEUR_MAP[couleur] ?? '#9ca3af';
    }

    return (
        <AppLayout title="Rapports & Statistiques">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Rapports & Statistiques</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Vue d'ensemble en temps réel des demandes de prise en charge.</p>
                </div>
                <Link href={route('rapports.exports')} className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Exports
                </Link>
            </div>

            {/* Filtres */}
            <div className="flex gap-3 mb-6">
                <select value={localFilters.annee_gestion_id}
                    onChange={(e) => { const v = e.target.value; setLocalFilters((f) => ({ ...f, annee_gestion_id: v })); applyFilters({ ...localFilters, annee_gestion_id: v }); }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 bg-white">
                    <option value="">Toutes les années</option>
                    {annees.map((a) => <option key={a.id} value={a.id}>{a.annee}</option>)}
                </select>
                <select value={localFilters.type_aide_id}
                    onChange={(e) => { const v = e.target.value; setLocalFilters((f) => ({ ...f, type_aide_id: v })); applyFilters({ ...localFilters, type_aide_id: v }); }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 bg-white">
                    <option value="">Tous les types</option>
                    {typesAide.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
                <div className="flex items-center px-3 py-2 bg-[#1B3A2D]/5 rounded-lg">
                    <span className="text-sm font-semibold text-[#1B3A2D]">{totalGeneral.toLocaleString('fr-FR')} demande(s)</span>
                </div>
            </div>

            {/* KPI par statut */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {parStatut.map((s) => (
                    <div key={s.statut} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{s.count.toLocaleString('fr-FR')}</p>
                        <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: couleurStatut(s.couleur) }} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Évolution 12 mois */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Évolution des demandes (12 mois)</h2>
                    <div className="overflow-x-auto">
                        <div className="flex items-end gap-1.5 h-40 min-w-full">
                            {evolution.map((m) => (
                                <div key={m.label} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                                    <span className="text-xs text-gray-500 font-medium">{m.total || ''}</span>
                                    <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                                        <div className="w-full rounded-t-sm bg-[#1B3A2D]/20 relative overflow-hidden" style={{ height: barHeight(m.total) }}>
                                            <div className="absolute bottom-0 left-0 right-0 bg-[#1B3A2D] rounded-t-sm" style={{ height: barHeight(m.approuvees) }} />
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 truncate w-full text-center">{m.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1B3A2D]" /><span className="text-xs text-gray-500">Approuvées</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1B3A2D]/20" /><span className="text-xs text-gray-500">Total</span></div>
                        </div>
                    </div>
                </div>

                {/* Par type d'aide */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Répartition par type d'aide</h2>
                    <div className="space-y-3">
                        {parType.map((t) => (
                            <div key={t.nom} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-gray-700 truncate">{t.nom}</span>
                                    <span className="text-gray-500 ml-2 shrink-0">{t.total} ({t.approuvees} app.)</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#1B3A2D] rounded-full transition-all" style={{ width: pct(t.total) + '%' }} />
                                </div>
                            </div>
                        ))}
                        {!parType.length && <p className="text-sm text-gray-400 py-4 text-center">Aucune donnée.</p>}
                    </div>
                </div>
            </div>

            {/* Par région */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-800">Répartition par région</h2>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-3 font-medium">Région</th>
                            <th className="text-right px-5 py-3 font-medium">Demandes</th>
                            <th className="text-left px-5 py-3 font-medium w-48">Proportion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parRegion.map((r) => (
                            <tr key={r.nom} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-medium text-gray-800">{r.nom}</td>
                                <td className="px-5 py-3 text-right font-semibold text-gray-700">{r.total.toLocaleString('fr-FR')}</td>
                                <td className="px-5 py-3">
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-40">
                                        <div className="h-full bg-[#1B3A2D]/70 rounded-full" style={{ width: pct(r.total) + '%' }} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!parRegion.length && (
                            <tr>
                                <td colSpan={3} className="px-5 py-8 text-center text-sm text-gray-400">Aucune donnée disponible.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
