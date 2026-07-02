import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import Modal from '@/Components/UI/Modal.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';

function formatDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : '—'; }
function statutLabel(s) { return { ouvert: 'Ouverte', cloture: 'Clôturée', archive: 'Archivée' }[s] ?? s; }

function periodeStatutLabel(p) {
    if (!p.actif) return 'Inactive';
    const now = new Date(), d = new Date(p.date_debut), f = new Date(p.date_fin);
    if (now < d) return 'À venir';
    if (now > f) return 'Expirée';
    return 'Active';
}

function periodeStatutClass(p) {
    const label = periodeStatutLabel(p);
    return {
        'Active': 'bg-green-100 text-green-700',
        'À venir': 'bg-blue-100 text-blue-700',
        'Expirée': 'bg-gray-100 text-gray-500',
        'Inactive': 'bg-gray-100 text-gray-400',
    }[label] ?? 'bg-gray-100 text-gray-500';
}

export default function PeriodesIndex({ periodes = [], evenements = [], annees = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const form = useForm({ evenement_id: '', annee_gestion_id: '', date_debut: '', date_fin: '', actif: true });

    function openModal(p = null) {
        setEditing(p);
        if (p) {
            form.setData({
                evenement_id: p.evenement_id ?? '',
                annee_gestion_id: p.annee_gestion_id ?? '',
                date_debut: p.date_debut?.slice(0, 10) ?? '',
                date_fin: p.date_fin?.slice(0, 10) ?? '',
                actif: p.actif,
            });
        } else {
            form.reset();
            form.setData('actif', true);
        }
        setShowModal(true);
    }

    function submit(e) {
        e?.preventDefault?.();
        const opts = { onSuccess: () => { setShowModal(false); form.reset(); } };
        if (editing) {
            form.put(route('referentiels.periodes.update', editing.id), opts);
        } else {
            form.post(route('referentiels.periodes.store'), opts);
        }
    }

    const [showDelete, setShowDelete] = useState(false);
    const [deletingPeriode, setDeletingPeriode] = useState(null);
    const deleteForm = useForm({});

    function confirmDel(p) { setDeletingPeriode(p); setShowDelete(true); }
    function execDelete() {
        deleteForm.delete(route('referentiels.periodes.destroy', deletingPeriode.id), {
            onSuccess: () => setShowDelete(false),
        });
    }

    return (
        <AppLayout title="Périodes d'ouverture">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Périodes d'ouverture</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Définissez les fenêtres de dépôt des demandes par événement.</p>
                </div>
                <button onClick={() => openModal()} className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Nouvelle période
                </button>
            </div>

            <FlashMessage />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-3 font-medium">Événement</th>
                            <th className="text-left px-4 py-3 font-medium">Type d'aide</th>
                            <th className="text-left px-4 py-3 font-medium">Année</th>
                            <th className="text-left px-4 py-3 font-medium">Début</th>
                            <th className="text-left px-4 py-3 font-medium">Fin</th>
                            <th className="text-left px-4 py-3 font-medium">Statut</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {periodes.map((p) => (
                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-medium text-gray-900">{p.evenement?.nom}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{p.evenement?.type_aide?.nom}</td>
                                <td className="px-4 py-3 font-semibold text-gray-700">{p.annee_gestion?.annee}</td>
                                <td className="px-4 py-3 text-gray-600">{formatDate(p.date_debut)}</td>
                                <td className="px-4 py-3 text-gray-600">{formatDate(p.date_fin)}</td>
                                <td className="px-4 py-3">
                                    <span className={[periodeStatutClass(p), 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'].join(' ')}>
                                        {periodeStatutLabel(p)}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openModal(p)} className="text-xs text-blue-600 hover:underline font-medium">Modifier</button>
                                        <button onClick={() => confirmDel(p)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!periodes.length && (
                            <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">Aucune période d'ouverture définie.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Create/Edit */}
            <Modal show={showModal} title={editing ? 'Modifier la période' : "Nouvelle période d'ouverture"} size="lg" onClose={() => setShowModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={submit} disabled={form.processing} className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                            {form.processing ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Créer')}
                        </button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-4">
                    {!editing && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Événement <span className="text-red-500">*</span></label>
                                <select value={form.data.evenement_id} onChange={(e) => form.setData('evenement_id', e.target.value)} className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.evenement_id ? 'border-red-300' : 'border-gray-300'].join(' ')}>
                                    <option value="">Sélectionner...</option>
                                    {evenements.map((ev) => <option key={ev.id} value={ev.id}>{ev.nom} ({ev.type_aide?.nom})</option>)}
                                </select>
                                {form.errors.evenement_id && <p className="mt-1 text-xs text-red-600">{form.errors.evenement_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Année de gestion <span className="text-red-500">*</span></label>
                                <select value={form.data.annee_gestion_id} onChange={(e) => form.setData('annee_gestion_id', e.target.value)} className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.annee_gestion_id ? 'border-red-300' : 'border-gray-300'].join(' ')}>
                                    <option value="">Sélectionner...</option>
                                    {annees.map((a) => <option key={a.id} value={a.id}>{a.annee} ({statutLabel(a.statut)})</option>)}
                                </select>
                                {form.errors.annee_gestion_id && <p className="mt-1 text-xs text-red-600">{form.errors.annee_gestion_id}</p>}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de début <span className="text-red-500">*</span></label>
                            <input value={form.data.date_debut} onChange={(e) => form.setData('date_debut', e.target.value)} type="date" className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.date_debut ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                            {form.errors.date_debut && <p className="mt-1 text-xs text-red-600">{form.errors.date_debut}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de fin <span className="text-red-500">*</span></label>
                            <input value={form.data.date_fin} onChange={(e) => form.setData('date_fin', e.target.value)} type="date" className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.date_fin ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                            {form.errors.date_fin && <p className="mt-1 text-xs text-red-600">{form.errors.date_fin}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={form.data.actif} onChange={(e) => form.setData('actif', e.target.checked)} id="periode-actif" className="w-4 h-4 rounded border-gray-300 text-[#1B3A2D]" />
                        <label htmlFor="periode-actif" className="text-sm text-gray-700">Période active</label>
                    </div>
                </form>
            </Modal>

            {/* Modal Suppression */}
            <Modal show={showDelete} title="Supprimer la période" size="sm" onClose={() => setShowDelete(false)}
                footer={
                    <>
                        <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={execDelete} disabled={deleteForm.processing} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
                            {deleteForm.processing ? 'Suppression...' : 'Supprimer'}
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-600">Voulez-vous supprimer la période <strong>{deletingPeriode?.evenement?.nom} — {deletingPeriode?.annee_gestion?.annee}</strong> ?</p>
            </Modal>
        </AppLayout>
    );
}
