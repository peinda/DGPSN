import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';

const tabs = [
    { key: 'attente', label: 'En attente' },
    { key: 'traitees', label: 'Traitées' },
];

function formatDate(d) {
    return d ? new Date(d).toLocaleDateString('fr-FR') : '—';
}

export default function ComiteIndex({ enAttente = [], traitees = [] }) {
    const [activeTab, setActiveTab] = useState('attente');

    return (
        <AppLayout title="Comité de délibération">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Comité de délibération</h1>
                    <p className="text-sm text-gray-500 mt-0.5">File d'attente des demandes à examiner.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
                        {enAttente.length} en attente
                    </span>
                </div>
            </div>

            <FlashMessage />

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
                {tabs.map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={[
                            activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                            'px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2',
                        ].join(' ')}>
                        {tab.label}
                        {tab.key === 'attente' && (
                            <span className={[
                                'px-1.5 py-0.5 text-xs rounded-full',
                                activeTab === 'attente' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-500',
                            ].join(' ')}>
                                {enAttente.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* File d'attente */}
            <div style={{ display: activeTab === 'attente' ? undefined : 'none' }}>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-medium">Référence</th>
                                <th className="text-left px-4 py-3 font-medium">Citoyen</th>
                                <th className="text-left px-4 py-3 font-medium">Type d'aide</th>
                                <th className="text-left px-4 py-3 font-medium">Agent</th>
                                <th className="text-left px-4 py-3 font-medium">Soumise le</th>
                                <th className="text-left px-4 py-3 font-medium">Statut</th>
                                <th className="text-right px-5 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enAttente.map((d) => (
                                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-mono text-xs text-gray-700 font-medium">{d.reference}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{d.citoyen?.prenom} {d.citoyen?.nom}</p>
                                        <p className="text-xs text-gray-400">{d.citoyen?.cin} — {d.citoyen?.commune?.nom ?? 'Localité non renseignée'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{d.type_aide?.nom}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{d.agent?.name}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.date_soumission)}</td>
                                    <td className="px-4 py-3">
                                        <span className={[d.statut === 'en_examen' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700', 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'].join(' ')}>
                                            {d.statut === 'en_examen' ? 'En examen' : 'Soumis'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <Link href={route('comite.show', d.id)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] px-3 py-1.5 rounded-lg transition-colors">
                                            Examiner
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!enAttente.length && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-14 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                            </svg>
                                            <p className="text-sm">Aucune demande en attente de délibération.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Déjà traitées */}
            <div style={{ display: activeTab === 'traitees' ? undefined : 'none' }}>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-medium">Référence</th>
                                <th className="text-left px-4 py-3 font-medium">Citoyen</th>
                                <th className="text-left px-4 py-3 font-medium">Type d'aide</th>
                                <th className="text-left px-4 py-3 font-medium">Délibérée par</th>
                                <th className="text-left px-4 py-3 font-medium">Date</th>
                                <th className="text-left px-4 py-3 font-medium">Décision</th>
                                <th className="text-right px-5 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {traitees.map((d) => (
                                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{d.reference}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900">{d.citoyen?.prenom} {d.citoyen?.nom}</p>
                                        <p className="text-xs text-gray-400">{d.citoyen?.commune?.nom ?? 'Localité non renseignée'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{d.type_aide?.nom}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{d.comite_user?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.date_deliberation)}</td>
                                    <td className="px-4 py-3">
                                        <span className={[d.statut === 'approuve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700', 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'].join(' ')}>
                                            {d.statut === 'approuve' ? 'Approuvée' : 'Rejetée'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right flex items-center justify-end gap-2">
                                        <Link href={route('comite.show', d.id)} className="text-xs text-blue-600 hover:underline font-medium">Détail</Link>
                                        {d.statut === 'approuve' && (
                                            <a href={route('comite.bon-pdf', d.id)} target="_blank" rel="noreferrer"
                                                className="text-xs text-[#1B3A2D] hover:underline font-medium flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                                PDF
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!traitees.length && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">Aucune demande traitée.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
