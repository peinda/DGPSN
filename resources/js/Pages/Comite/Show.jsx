import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';
import StatusBadge from '@/Components/UI/StatusBadge.jsx';
import Modal from '@/Components/UI/Modal.jsx';

function formatDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : '—'; }
function formatMontant(n) { return n ? new Intl.NumberFormat('fr-FR').format(n) : '0'; }
function cycleLabel(c) { return { jeune: 'Jeune', adulte: 'Adulte', vieillard: 'Vieillard' }[c] ?? c ?? '—'; }
function formatBytes(b) { const k = b / 1024; return k >= 1024 ? (k / 1024).toFixed(1) + ' Mo' : Math.round(k) + ' Ko'; }

export default function ComiteShow({ demande }) {
    const [showApprouverModal, setShowApprouverModal] = useState(false);
    const [showRejetModal, setShowRejetModal] = useState(false);

    const examinerForm = useForm({});
    const estMedical = ['ASSIST_MED', 'HOSP'].includes(demande.type_aide?.code);
    const approuverForm = useForm({ commentaire: '', montant_approuve: demande.montant_total ?? '' });
    const rejetForm = useForm({ commentaire: '' });

    const annee = demande.annee_gestion?.annee;
    const estRecurrent = demande.citoyen?.demandes?.some((d) =>
        d.id !== demande.id &&
        d.statut === 'approuve' &&
        d.annee_gestion?.annee < annee
    ) ?? false;

    const autresDemandes = demande.citoyen?.demandes?.filter((d) => d.id !== demande.id) ?? [];

    function approuver() {
        approuverForm.post(route('comite.approuver', demande.id), {
            onSuccess: () => setShowApprouverModal(false),
        });
    }

    function rejeter() {
        rejetForm.post(route('comite.rejeter', demande.id), {
            onSuccess: () => setShowRejetModal(false),
        });
    }

    return (
        <AppLayout title={`Délibération — ${demande.reference}`}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href={route('comite.index')} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{demande.reference}</h1>
                            <p className="text-sm text-gray-500">Soumise le {formatDate(demande.date_soumission)} par {demande.agent?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={demande.statut} />
                        {demande.statut === 'soumis' && (
                            <button onClick={() => examinerForm.post(route('comite.examiner', demande.id))}
                                disabled={examinerForm.processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-60">
                                Prendre en examen
                            </button>
                        )}
                        {demande.statut === 'en_examen' && (
                            <>
                                <button onClick={() => setShowRejetModal(true)}
                                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
                                    Rejeter
                                </button>
                                <button onClick={() => setShowApprouverModal(true)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                                    Approuver
                                </button>
                            </>
                        )}
                        {demande.statut === 'approuve' && (
                            <a href={route('comite.bon-pdf', demande.id)} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                Télécharger le bon PDF
                            </a>
                        )}
                    </div>
                </div>

                <FlashMessage />

                <div className="grid grid-cols-3 gap-5">
                    {/* Colonne principale */}
                    <div className="col-span-2 space-y-5">
                        {/* Citoyen */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                    Citoyen bénéficiaire
                                </h2>
                                {estRecurrent && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-semibold">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                        Citoyen récurrent
                                    </span>
                                )}
                            </div>
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div><dt className="text-xs text-gray-400">Nom complet</dt><dd className="font-semibold text-gray-900">{demande.citoyen?.prenom} {demande.citoyen?.nom}</dd></div>
                                <div><dt className="text-xs text-gray-400">CIN</dt><dd className="font-mono text-gray-700">{demande.citoyen?.cin}</dd></div>
                                <div><dt className="text-xs text-gray-400">Sexe</dt><dd className="text-gray-700">{demande.citoyen?.sexe === 'f' ? 'Féminin' : 'Masculin'}</dd></div>
                                <div><dt className="text-xs text-gray-400">Téléphone</dt><dd className="text-gray-700">{demande.citoyen?.telephone ?? '—'}</dd></div>
                                <div><dt className="text-xs text-gray-400">Date de naissance</dt><dd className="text-gray-700">{formatDate(demande.citoyen?.date_naissance)}</dd></div>
                                <div><dt className="text-xs text-gray-400">Âge / Cycle de vie</dt><dd className="text-gray-700">{demande.citoyen?.age != null ? `${demande.citoyen.age} ans — ${cycleLabel(demande.citoyen.cycle_vie)}` : '—'}</dd></div>
                                <div><dt className="text-xs text-gray-400">Commune</dt><dd className="text-gray-700">{demande.citoyen?.commune?.nom ?? '—'}</dd></div>
                                <div><dt className="text-xs text-gray-400">Département</dt><dd className="text-gray-700">{demande.citoyen?.commune?.departement?.nom ?? '—'}</dd></div>
                                <div><dt className="text-xs text-gray-400">Région</dt><dd className="text-gray-700">{demande.citoyen?.commune?.departement?.region?.nom ?? '—'}</dd></div>
                                <div><dt className="text-xs text-gray-400">Adresse</dt><dd className="text-gray-700">{demande.citoyen?.adresse ?? '—'}</dd></div>
                            </dl>

                            {autresDemandes.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Historique des demandes</p>
                                    <div className="space-y-2">
                                        {autresDemandes.map((d) => (
                                            <div key={d.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg">
                                                <div>
                                                    <span className="font-medium text-gray-700">{d.type_aide?.nom}</span>
                                                    <span className="text-gray-400 ml-2">{d.annee_gestion?.annee}</span>
                                                </div>
                                                <StatusBadge status={d.statut} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pièces jointes */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                                Pièces justificatives
                                <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{demande.pieces_jointes?.length ?? 0}</span>
                            </h2>
                            {demande.pieces_jointes?.length ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {demande.pieces_jointes.map((p) => (
                                        <a key={p.id} href={`/storage/${p.chemin}`} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-[#1B3A2D] hover:bg-green-50/30 transition-colors group">
                                            <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-800 truncate group-hover:text-[#1B3A2D]">{p.nom_original}</p>
                                                <p className="text-xs text-gray-400">{formatBytes(p.taille)}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-red-500 font-medium">⚠ Aucune pièce jointe.</p>
                            )}
                        </div>

                        {/* Commentaire de rejet */}
                        {demande.statut === 'rejete' && demande.commentaire && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                <h2 className="text-sm font-semibold text-red-700 mb-2">Motif de rejet</h2>
                                <p className="text-sm text-red-700 leading-relaxed">{demande.commentaire}</p>
                            </div>
                        )}
                    </div>

                    {/* Colonne latérale */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">Détails de la demande</h2>
                            <dl className="space-y-3 text-sm">
                                <div><dt className="text-xs text-gray-400 mb-0.5">Référence</dt><dd className="font-mono font-semibold text-gray-900">{demande.reference}</dd></div>
                                <div><dt className="text-xs text-gray-400 mb-0.5">Type d'aide</dt><dd className="font-semibold text-gray-900">{demande.type_aide?.nom}</dd></div>
                                <div><dt className="text-xs text-gray-400 mb-0.5">Événement</dt><dd className="text-gray-700">{demande.evenement?.nom ?? '—'}</dd></div>
                                <div><dt className="text-xs text-gray-400 mb-0.5">Année</dt><dd className="text-gray-700">{demande.annee_gestion?.annee}</dd></div>
                            </dl>
                        </div>

                        {/* Prestataires (non applicable aux événements religieux) */}
                        {demande.type_aide?.code !== 'EVENT_REL' && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-4">Prestataires</h2>
                                {demande.prestataires?.length ? (
                                    <div className="space-y-2">
                                        {demande.prestataires.map((p) => (
                                            <div key={p.id} className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-900">{p.nom}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{p.commune?.nom ?? '—'}</p>
                                                <p className="text-sm font-bold text-gray-800 mt-1">{formatMontant(p.pivot?.montant_estime)} FCFA</p>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold text-gray-900">
                                            <span>Total demandé</span>
                                            <span>{formatMontant(demande.montant_total)} FCFA</span>
                                        </div>
                                        {demande.statut === 'approuve' && demande.montant_approuve !== null && (
                                            <div className="flex justify-between text-sm font-bold text-green-700">
                                                <span>Montant approuvé</span>
                                                <span>{formatMontant(demande.montant_approuve)} FCFA</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">Aucun prestataire.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Approuver */}
            <Modal show={showApprouverModal} title="Approuver la demande" size="md" onClose={() => setShowApprouverModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowApprouverModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={approuver}
                            disabled={approuverForm.processing || (estMedical && approuverForm.data.montant_approuve === '')}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-60">
                            {approuverForm.processing ? 'Approbation...' : "Confirmer l'approbation"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">Vous êtes sur le point d'approuver la demande <strong>{demande.reference}</strong>. Un bon PDF sera généré automatiquement.</p>
                    </div>

                    {estMedical && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Montant approuvé (FCFA) <span className="text-red-500">*</span>
                                <span className="ml-1 text-xs font-normal text-gray-400">
                                    selon le budget disponible, dans la limite de la somme demandée
                                </span>
                            </label>
                            <input
                                value={approuverForm.data.montant_approuve}
                                onChange={(e) => approuverForm.setData('montant_approuve', e.target.value)}
                                type="number" min="0" max={demande.montant_total ?? undefined} step="1"
                                placeholder="0"
                                className={[
                                    'w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500',
                                    approuverForm.errors.montant_approuve ? 'border-red-300 bg-red-50' : 'border-gray-300',
                                ].join(' ')} />
                            <p className="mt-1 text-xs text-gray-500">
                                Somme demandée par le citoyen : <span className="font-semibold text-gray-700">{formatMontant(demande.montant_total)} FCFA</span>
                            </p>
                            {approuverForm.errors.montant_approuve && (
                                <p className="mt-1 text-xs text-red-600">{approuverForm.errors.montant_approuve}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Commentaire (optionnel)</label>
                        <textarea value={approuverForm.data.commentaire} onChange={(e) => approuverForm.setData('commentaire', e.target.value)} rows={3} placeholder="Observation du comité..."
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none" />
                    </div>
                </div>
            </Modal>

            {/* Modal Rejeter */}
            <Modal show={showRejetModal} title="Rejeter la demande" size="md" onClose={() => setShowRejetModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowRejetModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={rejeter} disabled={rejetForm.processing || !rejetForm.data.commentaire}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60">
                            {rejetForm.processing ? 'Rejet...' : 'Confirmer le rejet'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">Vous êtes sur le point de rejeter la demande <strong>{demande.reference}</strong>.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Motif de rejet <span className="text-red-500">*</span></label>
                        <textarea value={rejetForm.data.commentaire} onChange={(e) => rejetForm.setData('commentaire', e.target.value)} rows={4} placeholder="Expliquez le motif du rejet (obligatoire, min. 10 caractères)..."
                            className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none', rejetForm.errors.commentaire ? 'border-red-400' : 'border-gray-300 focus:border-red-400'].join(' ')} />
                        {rejetForm.errors.commentaire && <p className="mt-1 text-xs text-red-600">{rejetForm.errors.commentaire}</p>}
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
