import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';
import Modal from '@/Components/UI/Modal.jsx';

export default function TypesAideIndex({ typesAide = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modeEdition, setModeEdition] = useState(false);
    const [typeASelectionner, setTypeASelectionner] = useState(null);

    const typeForm = useForm({ nom: '', code: '', description: '', actif: true });
    const deleteForm = useForm({});
    const toggleForm = useForm({});

    function ouvrirCreation() {
        setModeEdition(false);
        typeForm.reset();
        typeForm.setData('actif', true);
        setShowModal(true);
    }

    function ouvrirEdition(type) {
        setModeEdition(true);
        setTypeASelectionner(type);
        typeForm.setData({
            nom: type.nom,
            code: type.code,
            description: type.description ?? '',
            actif: type.actif,
        });
        setShowModal(true);
    }

    function fermerModal() {
        setShowModal(false);
        typeForm.reset();
        typeForm.clearErrors();
    }

    function soumettre(e) {
        e?.preventDefault?.();
        if (modeEdition) {
            typeForm.put(route('referentiels.types-aide.update', typeASelectionner.id), {
                onSuccess: () => fermerModal(),
            });
        } else {
            typeForm.post(route('referentiels.types-aide.store'), {
                onSuccess: () => fermerModal(),
            });
        }
    }

    function confirmerSuppression(type) {
        setTypeASelectionner(type);
        setShowDeleteModal(true);
    }

    function supprimerType() {
        deleteForm.delete(route('referentiels.types-aide.destroy', typeASelectionner.id), {
            onSuccess: () => setShowDeleteModal(false),
        });
    }

    function toggleActif(type) {
        toggleForm.patch(route('referentiels.types-aide.toggle', type.id));
    }

    return (
        <AppLayout title="Types d'aide">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Types d'aide</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Catégories d'aide sociale gérées par la DGPSN.</p>
                </div>
                <button onClick={ouvrirCreation}
                    className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Nouveau type
                </button>
            </div>

            <FlashMessage />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-3 font-medium">Nom</th>
                            <th className="text-left px-4 py-3 font-medium">Code</th>
                            <th className="text-left px-4 py-3 font-medium">Description</th>
                            <th className="text-center px-4 py-3 font-medium">Demandes</th>
                            <th className="text-center px-4 py-3 font-medium">Statut</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {typesAide.map((type) => (
                            <tr key={type.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-medium text-gray-900">{type.nom}</td>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{type.code}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{type.description ?? '—'}</td>
                                <td className="px-4 py-3 text-center font-semibold text-gray-700">{type.demandes_count}</td>
                                <td className="px-4 py-3 text-center">
                                    <button onClick={() => toggleActif(type)}
                                        className={[type.actif ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200', 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors'].join(' ')}>
                                        <span className={[type.actif ? 'bg-green-500' : 'bg-gray-400', 'w-1.5 h-1.5 rounded-full'].join(' ')}></span>
                                        {type.actif ? 'Actif' : 'Inactif'}
                                    </button>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => ouvrirEdition(type)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Modifier</button>
                                        {type.demandes_count === 0 && (
                                            <button onClick={() => confirmerSuppression(type)} className="text-xs text-red-500 hover:text-red-700 font-medium">Supprimer</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!typesAide.length && (
                            <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">Aucun type d'aide configuré.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Créer / Modifier */}
            <Modal show={showModal} title={modeEdition ? "Modifier le type d'aide" : "Nouveau type d'aide"} onClose={fermerModal}
                footer={
                    <>
                        <button onClick={fermerModal} type="button" className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
                        <button onClick={soumettre} disabled={typeForm.processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-60">
                            {typeForm.processing ? 'Enregistrement...' : (modeEdition ? 'Mettre à jour' : 'Créer')}
                        </button>
                    </>
                }
            >
                <form onSubmit={soumettre} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                        <input value={typeForm.data.nom} onChange={(e) => typeForm.setData('nom', e.target.value)} type="text" placeholder="Ex : Aide médicale"
                            className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', typeForm.errors.nom ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                        {typeForm.errors.nom && <p className="mt-1 text-xs text-red-600">{typeForm.errors.nom}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Code <span className="text-red-500">*</span></label>
                        <input value={typeForm.data.code} onChange={(e) => typeForm.setData('code', e.target.value.toUpperCase())} type="text" placeholder="Ex : AIDE_MED" maxLength={30}
                            className={['w-full px-3 py-2.5 text-sm border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', typeForm.errors.code ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                        {typeForm.errors.code && <p className="mt-1 text-xs text-red-600">{typeForm.errors.code}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea value={typeForm.data.description} onChange={(e) => typeForm.setData('description', e.target.value)} rows={3} placeholder="Description optionnelle..."
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] resize-none" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input checked={typeForm.data.actif} onChange={(e) => typeForm.setData('actif', e.target.checked)} type="checkbox" id="actif-ref" className="w-4 h-4 rounded text-[#1B3A2D]" />
                        <label htmlFor="actif-ref" className="text-sm text-gray-700">Type d'aide actif</label>
                    </div>
                </form>
            </Modal>

            {/* Modal Suppression */}
            <Modal show={showDeleteModal} title="Supprimer le type d'aide" size="sm" onClose={() => setShowDeleteModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={supprimerType} disabled={deleteForm.processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60">
                            {deleteForm.processing ? 'Suppression...' : 'Supprimer'}
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-600">Voulez-vous supprimer <strong>{typeASelectionner?.nom}</strong> ? Cette action est irréversible.</p>
            </Modal>
        </AppLayout>
    );
}
