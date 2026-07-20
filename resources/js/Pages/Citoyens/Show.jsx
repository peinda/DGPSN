import { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';
import StatusBadge from '@/Components/UI/StatusBadge.jsx';
import Modal from '@/Components/UI/Modal.jsx';

function iconClass(statut) {
    return {
        approuve: 'bg-green-100 text-green-600',
        rejete: 'bg-red-100 text-red-500',
        cloture: 'bg-gray-100 text-gray-400',
        soumis: 'bg-blue-100 text-blue-500',
        en_examen: 'bg-purple-100 text-purple-500',
        brouillon: 'bg-gray-100 text-gray-400',
    }[statut] ?? 'bg-gray-100 text-gray-400';
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : '—'; }
function formatMontant(n) { return n ? new Intl.NumberFormat('fr-FR').format(n) : '0'; }
function cycleLabel(c) { return { jeune: 'Jeune', adulte: 'Adulte', vieillard: 'Vieillard' }[c] ?? c ?? '—'; }

export default function CitoyensShow({ citoyen }) {
    const { props } = usePage();
    const permissions = props.auth?.user?.permissions ?? [];
    function can(p) { return permissions.includes(p); }

    const [showEdit, setShowEdit] = useState(false);
    const editForm = useForm({
        prenom: citoyen.prenom,
        nom: citoyen.nom,
        telephone: citoyen.telephone ?? '',
        adresse: citoyen.adresse ?? '',
    });

    const initiales = [citoyen.prenom[0], citoyen.nom[0]].join('').toUpperCase();

    const anneeActuelle = new Date().getFullYear();
    const estRecurrent = citoyen.demandes?.some((d) =>
        d.statut === 'approuve' && d.annee_gestion?.annee < anneeActuelle
    ) ?? false;

    const demandesTriees = [...(citoyen.demandes ?? [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const demandes = citoyen.demandes ?? [];
    const statsStatut = [
        { label: 'Total', count: demandes.length },
        { label: 'Approuvées', count: demandes.filter((d) => d.statut === 'approuve').length },
        { label: 'En cours', count: demandes.filter((d) => ['soumis', 'en_examen', 'brouillon'].includes(d.statut)).length },
        { label: 'Rejetées', count: demandes.filter((d) => d.statut === 'rejete').length },
    ];

    function ouvrirEdition() {
        editForm.setData({
            prenom: citoyen.prenom,
            nom: citoyen.nom,
            telephone: citoyen.telephone ?? '',
            adresse: citoyen.adresse ?? '',
        });
        setShowEdit(true);
    }

    function sauvegarder(e) {
        e?.preventDefault?.();
        editForm.put(route('citoyens.update', citoyen.id), {
            onSuccess: () => setShowEdit(false),
        });
    }

    return (
        <AppLayout title={`Fiche — ${citoyen.prenom} ${citoyen.nom}`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href={route('citoyens.index')} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{citoyen.prenom} {citoyen.nom}</h1>
                            <p className="text-sm text-gray-500 font-mono">CIN : {citoyen.cin}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {estRecurrent && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full font-semibold">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                Citoyen récurrent
                            </span>
                        )}
                        {can('citoyens.creer') && (
                            <button onClick={ouvrirEdition}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                Modifier la fiche
                            </button>
                        )}
                        {can('demandes.creer') && (
                            <Link href={route('demandes.create')}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1B3A2D] border border-[#1B3A2D] hover:bg-[#1B3A2D]/5 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                Nouvelle demande
                            </Link>
                        )}
                    </div>
                </div>

                <FlashMessage />

                <div className="grid grid-cols-3 gap-5">
                    {/* Informations citoyen */}
                    <div className="col-span-1 space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="w-14 h-14 rounded-full bg-[#1B3A2D] text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                                {initiales}
                            </div>
                            <h2 className="text-center font-semibold text-gray-900 mb-1">{citoyen.prenom} {citoyen.nom}</h2>
                            <p className="text-center text-xs text-gray-400 font-mono mb-4">{citoyen.cin}</p>

                            <dl className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    <span className="text-gray-600">{citoyen.sexe === 'f' ? 'Féminin' : 'Masculin'}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    <div>
                                        <p className="text-gray-600">{formatDate(citoyen.date_naissance)}</p>
                                        {citoyen.age != null && (
                                            <p className="text-xs text-gray-400">{citoyen.age} ans — {cycleLabel(citoyen.cycle_vie)}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                    </svg>
                                    <span className="text-gray-600">{citoyen.telephone ?? 'Non renseigné'}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <div>
                                        <p className="text-gray-600">{citoyen.commune?.nom ?? '—'}</p>
                                        <p className="text-xs text-gray-400">{citoyen.commune?.departement?.region?.nom ?? ''}</p>
                                    </div>
                                </div>
                                {citoyen.adresse && (
                                    <div className="flex items-start gap-2">
                                        <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                        </svg>
                                        <span className="text-gray-600">{citoyen.adresse}</span>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Stats rapides */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Statistiques</h3>
                            <div className="space-y-2">
                                {statsStatut.map((stat) => (
                                    <div key={stat.label} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{stat.label}</span>
                                        <span className="font-semibold text-gray-800">{stat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Historique des demandes */}
                    <div className="col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-800">
                                    Historique des demandes
                                    <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{citoyen.demandes?.length ?? 0}</span>
                                </h2>
                            </div>

                            {citoyen.demandes?.length ? (
                                <div>
                                    {demandesTriees.map((d) => (
                                        <div key={d.id}
                                            className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                                            <div className={['w-9 h-9 rounded-full flex items-center justify-center shrink-0', iconClass(d.statut)].join(' ')}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {d.statut === 'approuve' ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                                    ) : d.statut === 'rejete' ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                                    )}
                                                </svg>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-sm font-semibold text-gray-900">{d.type_aide?.nom}</span>
                                                    {d.evenement && <span className="text-xs text-gray-400">— {d.evenement.nom}</span>}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    <span className="font-mono">{d.reference ?? '—'}</span>
                                                    <span>{d.annee_gestion?.annee}</span>
                                                    <span>{formatDate(d.created_at)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {d.montant_total && (
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {formatMontant(d.montant_total)} F
                                                    </span>
                                                )}
                                                <StatusBadge status={d.statut} />
                                                <Link href={route('demandes.show', d.id)} className="p-1.5 text-gray-400 hover:text-[#1B3A2D] hover:bg-gray-100 rounded-lg transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-5 py-14 text-center">
                                    <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <p className="text-sm text-gray-400">Aucune demande enregistrée.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal édition citoyen */}
            <Modal show={showEdit} title="Modifier la fiche citoyen" size="lg" onClose={() => setShowEdit(false)}
                footer={
                    <>
                        <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={sauvegarder} disabled={editForm.processing} className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                            {editForm.processing ? 'Enregistrement...' : 'Sauvegarder'}
                        </button>
                    </>
                }
            >
                <form onSubmit={sauvegarder} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom <span className="text-red-500">*</span></label>
                            <input value={editForm.data.prenom} onChange={(e) => editForm.setData('prenom', e.target.value)} type="text"
                                className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', editForm.errors.prenom ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                            {editForm.errors.prenom && <p className="mt-1 text-xs text-red-600">{editForm.errors.prenom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                            <input value={editForm.data.nom} onChange={(e) => editForm.setData('nom', e.target.value)} type="text"
                                className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', editForm.errors.nom ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                            {editForm.errors.nom && <p className="mt-1 text-xs text-red-600">{editForm.errors.nom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                            <input value={editForm.data.telephone} onChange={(e) => editForm.setData('telephone', e.target.value)} type="text"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                            {editForm.errors.telephone && <p className="mt-1 text-xs text-red-600">{editForm.errors.telephone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">CIN</label>
                            <input value={citoyen.cin} type="text" disabled className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 font-mono" />
                            <p className="mt-1 text-xs text-gray-400">Le CIN ne peut pas être modifié.</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                            <input value={editForm.data.adresse} onChange={(e) => editForm.setData('adresse', e.target.value)} type="text"
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                        </div>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
