import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';
import Modal from '@/Components/UI/Modal.jsx';

export default function ParametresIndex({ userData, typesAide = [], isAdmin = false }) {
    const tabs = [{ key: 'profil', label: 'Mon profil' }];
    if (isAdmin) tabs.push({ key: 'types-aide', label: "Types d'aide" });
    const [activeTab, setActiveTab] = useState('profil');

    const initiales = (userData.name ?? 'U').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    const roleLabel = (() => {
        const labels = { administrateur: 'Administrateur', agent: 'Agent', comite: 'Comité' };
        return labels[userData.role] ?? 'Utilisateur';
    })();

    const profilForm = useForm({ name: userData.name ?? '', email: userData.email ?? '' });
    const mdpForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    function sauvegarderProfil(e) {
        e.preventDefault();
        profilForm.put(route('parametres.update-profil'));
    }
    function changerMotDePasse(e) {
        e.preventDefault();
        mdpForm.put(route('parametres.update-password'), { onSuccess: () => mdpForm.reset() });
    }

    // Types d'aide
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
        <AppLayout title="Paramètres">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gérez votre profil et la configuration de l'application.</p>
                </div>

                <FlashMessage />

                {/* Onglets */}
                <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                    {tabs.map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={[activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700', 'px-4 py-2 text-sm font-medium rounded-md transition-all'].join(' ')}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ===== Onglet Profil ===== */}
                <div style={{ display: activeTab === 'profil' ? undefined : 'none' }} className="space-y-5">
                    {/* Carte identité */}
                    <div className="bg-[#1B3A2D] rounded-xl p-6 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-white/30">
                            {initiales}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-white truncate">{userData.name}</p>
                            <p className="text-sm text-white/70 truncate">{userData.email}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                                    {roleLabel}
                                </span>
                                <span className="text-xs text-white/50">Membre depuis le {userData.created_at}</span>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire profil */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            Informations du profil
                        </h2>
                        <form onSubmit={sauvegarderProfil} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet <span className="text-red-500">*</span></label>
                                <input value={profilForm.data.name} onChange={(e) => profilForm.setData('name', e.target.value)} type="text" placeholder="Votre nom complet"
                                    className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors', profilForm.errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'].join(' ')} />
                                {profilForm.errors.name && <p className="mt-1 text-xs text-red-600">{profilForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email <span className="text-red-500">*</span></label>
                                <input value={profilForm.data.email} onChange={(e) => profilForm.setData('email', e.target.value)} type="email" placeholder="votre@email.com"
                                    className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors', profilForm.errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'].join(' ')} />
                                {profilForm.errors.email && <p className="mt-1 text-xs text-red-600">{profilForm.errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rôle</label>
                                <input type="text" value={roleLabel} disabled
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                                <p className="mt-1 text-xs text-gray-400">Le rôle est géré par l'administrateur.</p>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                {profilForm.recentlySuccessful ? (
                                    <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                        Profil sauvegardé
                                    </p>
                                ) : <span />}
                                <button type="submit" disabled={profilForm.processing}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-60">
                                    {profilForm.processing ? 'Enregistrement...' : 'Sauvegarder'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Mot de passe */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            Changer le mot de passe
                        </h2>
                        <form onSubmit={changerMotDePasse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel <span className="text-red-500">*</span></label>
                                <input value={mdpForm.data.current_password} onChange={(e) => mdpForm.setData('current_password', e.target.value)} type="password" placeholder="••••••••"
                                    className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors', mdpForm.errors.current_password ? 'border-red-300 bg-red-50' : 'border-gray-300'].join(' ')} />
                                {mdpForm.errors.current_password && <p className="mt-1 text-xs text-red-600">{mdpForm.errors.current_password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe <span className="text-red-500">*</span></label>
                                <input value={mdpForm.data.password} onChange={(e) => mdpForm.setData('password', e.target.value)} type="password" placeholder="••••••••"
                                    className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors', mdpForm.errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'].join(' ')} />
                                {mdpForm.errors.password && <p className="mt-1 text-xs text-red-600">{mdpForm.errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le nouveau mot de passe <span className="text-red-500">*</span></label>
                                <input value={mdpForm.data.password_confirmation} onChange={(e) => mdpForm.setData('password_confirmation', e.target.value)} type="password" placeholder="••••••••"
                                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors" />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                {mdpForm.recentlySuccessful ? (
                                    <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                        Mot de passe modifié
                                    </p>
                                ) : <span />}
                                <button type="submit" disabled={mdpForm.processing}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-60">
                                    {mdpForm.processing ? 'Modification...' : 'Changer le mot de passe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ===== Onglet Types d'aide ===== */}
                <div style={{ display: activeTab === 'types-aide' ? undefined : 'none' }}>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Types d'aide sociale</p>
                                <p className="text-xs text-gray-500 mt-0.5">Catégories d'aide gérées par la DGPSN.</p>
                            </div>
                            <button onClick={ouvrirCreation}
                                className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                Nouveau type
                            </button>
                        </div>

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
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600 bg-gray-50/50">{type.code}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{type.description ?? '—'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-semibold text-gray-700">{type.demandes_count}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => toggleActif(type)}
                                                className={[type.actif ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200', 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors'].join(' ')}>
                                                <span className={[type.actif ? 'bg-green-500' : 'bg-gray-400', 'w-1.5 h-1.5 rounded-full'].join(' ')}></span>
                                                {type.actif ? 'Actif' : 'Inactif'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => ouvrirEdition(type)} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                                    Modifier
                                                </button>
                                                {type.demandes_count === 0 && (
                                                    <button onClick={() => confirmerSuppression(type)} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!typesAide.length && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                                            Aucun type d'aide configuré.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Créer / Modifier */}
            <Modal show={showModal} title={modeEdition ? "Modifier le type d'aide" : "Nouveau type d'aide"} onClose={fermerModal}
                footer={
                    <>
                        <button onClick={fermerModal} type="button" className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Annuler
                        </button>
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
                            className={['w-full px-3 py-2.5 text-sm border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] uppercase', typeForm.errors.code ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                        {typeForm.errors.code && <p className="mt-1 text-xs text-red-600">{typeForm.errors.code}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea value={typeForm.data.description} onChange={(e) => typeForm.setData('description', e.target.value)} rows={3} placeholder="Description optionnelle..."
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] resize-none" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input checked={typeForm.data.actif} onChange={(e) => typeForm.setData('actif', e.target.checked)} type="checkbox" id="actif" className="w-4 h-4 rounded text-[#1B3A2D]" />
                        <label htmlFor="actif" className="text-sm text-gray-700">Type d'aide actif</label>
                    </div>
                </form>
            </Modal>

            {/* Modal Suppression */}
            <Modal show={showDeleteModal} title="Supprimer le type d'aide" size="sm" onClose={() => setShowDeleteModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={supprimerType} disabled={deleteForm.processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60">
                            {deleteForm.processing ? 'Suppression...' : 'Supprimer'}
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-600">Voulez-vous supprimer le type d'aide <strong>{typeASelectionner?.nom}</strong> ? Cette action est irréversible.</p>
            </Modal>
        </AppLayout>
    );
}
