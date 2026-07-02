import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import Modal from '@/Components/UI/Modal.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';

function statutLabel(statut) {
    return { ouvert: 'Ouverte', cloture: 'Clôturée', archive: 'Archivée' }[statut] ?? statut;
}

function statutClass(statut) {
    return {
        ouvert: 'bg-green-100 text-green-700',
        cloture: 'bg-yellow-100 text-yellow-700',
        archive: 'bg-gray-100 text-gray-500',
    }[statut] ?? 'bg-gray-100 text-gray-500';
}

function formatDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('fr-FR');
}

export default function AnneesIndex({ annees = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState('');
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [selectedAnnee, setSelectedAnnee] = useState(null);

    const form = useForm({ annee: new Date().getFullYear(), date_ouverture: '' });
    const actionForm = useForm({});

    function openCreate() {
        form.reset();
        form.setData('annee', new Date().getFullYear());
        setShowModal(true);
    }

    function submit(e) {
        e?.preventDefault?.();
        form.post(route('referentiels.annees.store'), {
            onSuccess: () => { setShowModal(false); form.reset(); },
        });
    }

    function confirmerAction(annee, action) {
        setSelectedAnnee(annee);
        setConfirmAction(action);
        if (action === 'cloturer') {
            setConfirmTitle("Clôturer l'année");
            setConfirmMessage(`Voulez-vous clôturer l'année de gestion ${annee.annee} ? Aucune nouvelle demande ne pourra être soumise.`);
        } else {
            setConfirmTitle("Archiver l'année");
            setConfirmMessage(`Voulez-vous archiver l'année de gestion ${annee.annee} ? Cette action est irréversible.`);
        }
        setShowConfirm(true);
    }

    function executeAction() {
        const routeName = confirmAction === 'cloturer'
            ? 'referentiels.annees.cloturer'
            : 'referentiels.annees.archiver';

        actionForm.post(route(routeName, selectedAnnee.id), {
            onSuccess: () => setShowConfirm(false),
        });
    }

    return (
        <AppLayout title="Années de gestion">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Années de gestion</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gérez les années calendaires et leur statut.</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Nouvelle année
                </button>
            </div>

            <FlashMessage />

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-3 font-medium">Année</th>
                            <th className="text-left px-4 py-3 font-medium">Statut</th>
                            <th className="text-left px-4 py-3 font-medium">Date d'ouverture</th>
                            <th className="text-left px-4 py-3 font-medium">Date de clôture</th>
                            <th className="text-right px-4 py-3 font-medium">Demandes</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {annees.map((annee) => (
                            <tr key={annee.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-semibold text-gray-900">{annee.annee}</td>
                                <td className="px-4 py-3">
                                    <span className={[statutClass(annee.statut), 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'].join(' ')}>
                                        {statutLabel(annee.statut)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{formatDate(annee.date_ouverture)}</td>
                                <td className="px-4 py-3 text-gray-600">{formatDate(annee.date_cloture) ?? '—'}</td>
                                <td className="px-4 py-3 text-right font-medium text-gray-700">{annee.demandes_count}</td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {annee.statut === 'ouvert' && (
                                            <button onClick={() => confirmerAction(annee, 'cloturer')}
                                                className="text-xs text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-2.5 py-1 rounded-lg transition-colors font-medium">
                                                Clôturer
                                            </button>
                                        )}
                                        {annee.statut === 'cloture' && (
                                            <button onClick={() => confirmerAction(annee, 'archiver')}
                                                className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors font-medium">
                                                Archiver
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!annees.length && (
                            <tr>
                                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">Aucune année de gestion créée.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Création */}
            <Modal show={showModal} title="Nouvelle année de gestion" onClose={() => setShowModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} type="button" className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
                        <button onClick={submit} disabled={form.processing} className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] transition-colors disabled:opacity-60">
                            {form.processing ? 'Création...' : 'Créer'}
                        </button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Année <span className="text-red-500">*</span></label>
                        <input value={form.data.annee} onChange={(e) => form.setData('annee', e.target.value)} type="number" min="2020" max="2099" placeholder="ex: 2025"
                            className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.annee ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                        {form.errors.annee && <p className="mt-1 text-xs text-red-600">{form.errors.annee}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date d'ouverture</label>
                        <input value={form.data.date_ouverture} onChange={(e) => form.setData('date_ouverture', e.target.value)} type="date"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                    </div>
                </form>
            </Modal>

            {/* Modal Confirmation action */}
            <Modal show={showConfirm} title={confirmTitle} size="sm" onClose={() => setShowConfirm(false)}
                footer={
                    <>
                        <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={executeAction} disabled={actionForm.processing}
                            className={[confirmAction === 'cloturer' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700', 'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60'].join(' ')}>
                            {actionForm.processing ? 'En cours...' : 'Confirmer'}
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-600">{confirmMessage}</p>
            </Modal>
        </AppLayout>
    );
}
