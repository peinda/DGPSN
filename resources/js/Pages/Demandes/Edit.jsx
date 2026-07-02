import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';

function typeLabel(t) {
    return { hopital: 'Hôpital', pharmacie: 'Pharmacie', clinique: 'Clinique', autre: 'Autre' }[t] ?? t;
}

export default function DemandesEdit({ demande, typesAide = [], prestataires = [], annees = [] }) {
    const [searchPrestataire, setSearchPrestataire] = useState('');

    const form = useForm({
        type_aide_id: demande.type_aide_id ?? '',
        evenement_id: demande.evenement_id ?? '',
        annee_gestion_id: demande.annee_gestion_id ?? '',
        periode_ouverture_id: demande.periode_ouverture_id ?? '',
        prestataires: (demande.prestataires ?? []).map((p) => ({
            id: p.id,
            montant_estime: p.pivot?.montant_estime ?? 0,
        })),
    });

    const evenementsFiltres = typesAide.find((t) => t.id == form.data.type_aide_id)?.evenements ?? [];

    const ids = form.data.prestataires.map((p) => p.id);
    const prestatairesDisponibles = prestataires.filter((p) =>
        !ids.includes(p.id) &&
        (!searchPrestataire || p.nom.toLowerCase().includes(searchPrestataire.toLowerCase()))
    );

    const totalFormate = new Intl.NumberFormat('fr-FR').format(
        form.data.prestataires.reduce((s, p) => s + (p.montant_estime || 0), 0)
    );

    function ajouterPrestataire(p) {
        form.setData('prestataires', [...form.data.prestataires, { id: p.id, montant_estime: 0 }]);
        setSearchPrestataire('');
    }

    function updatePrestataireMontant(index, value) {
        const montant = value === '' ? 0 : Number(value);
        form.setData('prestataires', form.data.prestataires.map((p, i) => i === index ? { ...p, montant_estime: montant } : p));
    }

    function retirerPrestataire(index) {
        form.setData('prestataires', form.data.prestataires.filter((_, i) => i !== index));
    }

    function prestataireName(id) { return prestataires.find((p) => p.id === id)?.nom ?? ''; }

    function sauvegarder() {
        form.put(route('demandes.update', demande.id));
    }

    return (
        <AppLayout title={`Modifier — ${demande.reference ?? 'Brouillon'}`}>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link href={route('demandes.show', demande.id)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Modifier la demande</h1>
                        <p className="text-sm text-gray-500">{demande.reference ?? 'Brouillon'} — {demande.citoyen?.prenom} {demande.citoyen?.nom}</p>
                    </div>
                </div>

                <FlashMessage />

                {/* Type d'aide */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Type d'aide & événement</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Année de gestion <span className="text-red-500">*</span></label>
                            <select value={form.data.annee_gestion_id} onChange={(e) => form.setData('annee_gestion_id', e.target.value)}
                                className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.annee_gestion_id ? 'border-red-300' : 'border-gray-300'].join(' ')}>
                                {annees.map((a) => <option key={a.id} value={a.id}>{a.annee}</option>)}
                            </select>
                            {form.errors.annee_gestion_id && <p className="mt-1 text-xs text-red-600">{form.errors.annee_gestion_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type d'aide <span className="text-red-500">*</span></label>
                            <select value={form.data.type_aide_id} onChange={(e) => form.setData((d) => ({ ...d, type_aide_id: e.target.value, evenement_id: '' }))}
                                className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.type_aide_id ? 'border-red-300' : 'border-gray-300'].join(' ')}>
                                <option value="">Sélectionner...</option>
                                {typesAide.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                            </select>
                            {form.errors.type_aide_id && <p className="mt-1 text-xs text-red-600">{form.errors.type_aide_id}</p>}
                        </div>
                        {evenementsFiltres.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Événement</label>
                                <select value={form.data.evenement_id} onChange={(e) => form.setData('evenement_id', e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                                    <option value="">— Aucun —</option>
                                    {evenementsFiltres.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Prestataires */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Prestataires & montants</h2>

                    {form.data.prestataires.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {form.data.prestataires.map((p, i) => (
                                <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="flex-1 text-sm font-medium text-gray-800">{prestataireName(p.id)}</span>
                                    <input value={p.montant_estime} onChange={(e) => updatePrestataireMontant(i, e.target.value)}
                                        type="number" min="0" placeholder="Montant (FCFA)"
                                        className="w-36 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                                    <button type="button" onClick={() => retirerPrestataire(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>
                                </div>
                            ))}
                            <div className="text-right text-sm font-semibold text-gray-800 pt-1">
                                Total : {totalFormate} FCFA
                            </div>
                        </div>
                    )}

                    <div className="border border-dashed border-gray-300 rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-500 mb-3">Ajouter un prestataire</p>
                        <div className="relative mb-2">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <input value={searchPrestataire} onChange={(e) => setSearchPrestataire(e.target.value)} type="text" placeholder="Rechercher..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1">
                            {prestatairesDisponibles.map((p) => (
                                <button key={p.id} type="button" onClick={() => ajouterPrestataire(p)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-[#1B3A2D]/5 text-left transition-colors">
                                    <span className="font-medium text-gray-800">{p.nom}</span>
                                    <span className="text-xs text-gray-400">{typeLabel(p.type)}</span>
                                </button>
                            ))}
                            {!prestatairesDisponibles.length && <p className="text-xs text-gray-400 text-center py-2">Aucun prestataire.</p>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href={route('demandes.show', demande.id)} className="px-5 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Annuler
                    </Link>
                    <button onClick={sauvegarder} disabled={form.processing}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-60">
                        {form.processing ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
