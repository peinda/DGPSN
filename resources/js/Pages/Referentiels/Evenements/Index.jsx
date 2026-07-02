import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import Modal from '@/Components/UI/Modal.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';

const tabs = [
    { key: 'types', label: "Types d'aide" },
    { key: 'evenements', label: 'Événements' },
];

export default function EvenementsIndex({ typesAide = [], evenements = [] }) {
    const [activeTab, setActiveTab] = useState('types');

    // --- Types d'aide ---
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const typeForm = useForm({ nom: '', code: '', description: '', actif: true });

    function openTypeModal(type = null) {
        setEditingType(type);
        if (type) {
            typeForm.setData({ nom: type.nom, code: type.code, description: type.description ?? '', actif: type.actif });
        } else {
            typeForm.reset();
            typeForm.setData('actif', true);
        }
        setShowTypeModal(true);
    }

    function submitType(e) {
        e?.preventDefault?.();
        const opts = { onSuccess: () => { setShowTypeModal(false); typeForm.reset(); } };
        if (editingType) {
            typeForm.put(route('referentiels.types-aide.update', editingType.id), opts);
        } else {
            typeForm.post(route('referentiels.types-aide.store'), opts);
        }
    }

    // --- Événements ---
    const [showEvenementModal, setShowEvenementModal] = useState(false);
    const [editingEvenement, setEditingEvenement] = useState(null);
    const evForm = useForm({ type_aide_id: '', nom: '', code: '', description: '', actif: true });

    function openEvenementModal(ev = null) {
        setEditingEvenement(ev);
        if (ev) {
            evForm.setData({ type_aide_id: ev.type_aide_id, nom: ev.nom, code: ev.code, description: ev.description ?? '', actif: ev.actif });
        } else {
            evForm.reset();
            evForm.setData('actif', true);
        }
        setShowEvenementModal(true);
    }

    function submitEvenement(e) {
        e?.preventDefault?.();
        const opts = { onSuccess: () => { setShowEvenementModal(false); evForm.reset(); } };
        if (editingEvenement) {
            evForm.put(route('referentiels.evenements.update', editingEvenement.id), opts);
        } else {
            evForm.post(route('referentiels.evenements.store'), opts);
        }
    }

    // --- Suppression ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [deletingKind, setDeletingKind] = useState('');
    const deleteForm = useForm({});

    function confirmDelete(kind, item) {
        setDeletingKind(kind);
        setDeletingItem(item);
        setShowDeleteModal(true);
    }

    function executeDelete() {
        const r = deletingKind === 'type'
            ? route('referentiels.types-aide.destroy', deletingItem.id)
            : route('referentiels.evenements.destroy', deletingItem.id);
        deleteForm.delete(r, { onSuccess: () => setShowDeleteModal(false) });
    }

    return (
        <AppLayout title="Événements & Types d'aide">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Événements & Types d'aide</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gérez les catégories et événements déclencheurs des demandes.</p>
                </div>
            </div>

            <FlashMessage />

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
                {tabs.map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={[activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700', 'px-4 py-2 text-sm font-medium rounded-md transition-all'].join(' ')}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Types d'aide */}
            <div style={{ display: activeTab === 'types' ? undefined : 'none' }}>
                <div className="flex justify-end mb-4">
                    <button onClick={() => openTypeModal()} className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        Nouveau type
                    </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-medium">Nom</th>
                                <th className="text-left px-4 py-3 font-medium">Code</th>
                                <th className="text-left px-4 py-3 font-medium">Description</th>
                                <th className="text-left px-4 py-3 font-medium">Statut</th>
                                <th className="text-right px-5 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {typesAide.map((type) => (
                                <tr key={type.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-gray-900">{type.nom}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{type.code}</td>
                                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{type.description ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={[type.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500', 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'].join(' ')}>
                                            {type.actif ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openTypeModal(type)} className="text-xs text-blue-600 hover:underline font-medium">Modifier</button>
                                            <button onClick={() => confirmDelete('type', type)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!typesAide.length && (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">Aucun type d'aide créé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Événements */}
            <div style={{ display: activeTab === 'evenements' ? undefined : 'none' }}>
                <div className="flex justify-end mb-4">
                    <button onClick={() => openEvenementModal()} className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        Nouvel événement
                    </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-medium">Nom</th>
                                <th className="text-left px-4 py-3 font-medium">Type d'aide</th>
                                <th className="text-left px-4 py-3 font-medium">Code</th>
                                <th className="text-left px-4 py-3 font-medium">Statut</th>
                                <th className="text-right px-5 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evenements.map((ev) => (
                                <tr key={ev.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-gray-900">{ev.nom}</td>
                                    <td className="px-4 py-3 text-gray-600">{ev.type_aide?.nom}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{ev.code}</td>
                                    <td className="px-4 py-3">
                                        <span className={[ev.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500', 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'].join(' ')}>
                                            {ev.actif ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEvenementModal(ev)} className="text-xs text-blue-600 hover:underline font-medium">Modifier</button>
                                            <button onClick={() => confirmDelete('evenement', ev)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!evenements.length && (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">Aucun événement créé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Type d'aide */}
            <Modal show={showTypeModal} title={editingType ? "Modifier le type d'aide" : "Nouveau type d'aide"} onClose={() => setShowTypeModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowTypeModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={submitType} disabled={typeForm.processing} className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                            {typeForm.processing ? 'Enregistrement...' : (editingType ? 'Mettre à jour' : 'Créer')}
                        </button>
                    </>
                }
            >
                <form onSubmit={submitType} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                        <input value={typeForm.data.nom} onChange={(e) => typeForm.setData('nom', e.target.value)} type="text" className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', typeForm.errors.nom ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                        {typeForm.errors.nom && <p className="mt-1 text-xs text-red-600">{typeForm.errors.nom}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Code <span className="text-red-500">*</span></label>
                        <input value={typeForm.data.code} onChange={(e) => typeForm.setData('code', e.target.value)} type="text" placeholder="ex: ASSIST_MED" className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] font-mono uppercase', typeForm.errors.code ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                        {typeForm.errors.code && <p className="mt-1 text-xs text-red-600">{typeForm.errors.code}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea value={typeForm.data.description} onChange={(e) => typeForm.setData('description', e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] resize-none" />
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={typeForm.data.actif} onChange={(e) => typeForm.setData('actif', e.target.checked)} id="type-actif" className="w-4 h-4 rounded border-gray-300 text-[#1B3A2D]" />
                        <label htmlFor="type-actif" className="text-sm text-gray-700">Actif</label>
                    </div>
                </form>
            </Modal>

            {/* Modal Événement */}
            <Modal show={showEvenementModal} title={editingEvenement ? "Modifier l'événement" : 'Nouvel événement'} onClose={() => setShowEvenementModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowEvenementModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={submitEvenement} disabled={evForm.processing} className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                            {evForm.processing ? 'Enregistrement...' : (editingEvenement ? 'Mettre à jour' : 'Créer')}
                        </button>
                    </>
                }
            >
                <form onSubmit={submitEvenement} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Type d'aide <span className="text-red-500">*</span></label>
                        <select value={evForm.data.type_aide_id} onChange={(e) => evForm.setData('type_aide_id', e.target.value)} className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', evForm.errors.type_aide_id ? 'border-red-300' : 'border-gray-300'].join(' ')}>
                            <option value="">Sélectionner un type...</option>
                            {typesAide.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                        </select>
                        {evForm.errors.type_aide_id && <p className="mt-1 text-xs text-red-600">{evForm.errors.type_aide_id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                        <input value={evForm.data.nom} onChange={(e) => evForm.setData('nom', e.target.value)} type="text" className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', evForm.errors.nom ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                        {evForm.errors.nom && <p className="mt-1 text-xs text-red-600">{evForm.errors.nom}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Code <span className="text-red-500">*</span></label>
                        <input value={evForm.data.code} onChange={(e) => evForm.setData('code', e.target.value)} type="text" placeholder="ex: TABASKI_2025" className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] font-mono uppercase', evForm.errors.code ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                        {evForm.errors.code && <p className="mt-1 text-xs text-red-600">{evForm.errors.code}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea value={evForm.data.description} onChange={(e) => evForm.setData('description', e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] resize-none" />
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={evForm.data.actif} onChange={(e) => evForm.setData('actif', e.target.checked)} id="ev-actif" className="w-4 h-4 rounded border-gray-300 text-[#1B3A2D]" />
                        <label htmlFor="ev-actif" className="text-sm text-gray-700">Actif</label>
                    </div>
                </form>
            </Modal>

            {/* Modal Suppression */}
            <Modal show={showDeleteModal} title="Confirmer la suppression" size="sm" onClose={() => setShowDeleteModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={executeDelete} disabled={deleteForm.processing} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
                            {deleteForm.processing ? 'Suppression...' : 'Supprimer'}
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-600">Cette action est irréversible. Voulez-vous supprimer <strong>{deletingItem?.nom}</strong> ?</p>
            </Modal>
        </AppLayout>
    );
}
