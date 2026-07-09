import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';

const steps = [
    { id: 1, label: 'Citoyen' },
    { id: 2, label: "Type d'aide" },
    { id: 3, label: 'Prestataires' },
    { id: 4, label: 'Pièces jointes' },
];

const DOCUMENTS_PAR_TYPE = {
    ASSIST_MED: [
        { label: "Demande manuscrite adressée à l'autorité compétente", requis: true },
        { label: "Copie de la pièce nationale d'identité", requis: true },
        { label: "Dossier médical accompagné d'un devis ou d'une facture des frais de soins", requis: true },
        { label: "Certificat d'indigence en cours de validité", requis: true },
    ],
    HOSP: [
        { label: "Demande manuscrite adressée à l'autorité compétente", requis: true },
        { label: "Copie de la pièce nationale d'identité", requis: true },
        { label: "Bulletin d'hospitalisation accompagné d'un devis ou d'une facture des frais", requis: true },
        { label: "Certificat d'indigence en cours de validité", requis: true },
    ],
    EVENT_REL: [
        { label: "Demande manuscrite adressée à l'autorité compétente", requis: true },
        { label: "Copie de la pièce nationale d'identité", requis: true },
    ],
    URGENCE: [
        { label: "Demande manuscrite adressée à l'autorité compétente", requis: true },
        { label: "Copie de la pièce nationale d'identité", requis: true },
        { label: "Document justificatif de l'urgence sociale (rapport de situation, etc.)", requis: true },
        { label: "Certificat d'indigence en cours de validité", requis: true },
    ],
};

const TEL_REGEX = /^\+221(70|71|75|76|77|78)[0-9]{7}$/;
const NOM_REGEX = /^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ][A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ\s\-']*$/;

function telValide(tel) { return TEL_REGEX.test(tel); }
function telErreurLocale(tel) {
    if (!tel) return '';
    if (!tel.startsWith('+221')) return 'Doit commencer par +221.';
    if (tel.length < 13) return 'Numéro incomplet.';
    if (tel.length > 13) return 'Numéro trop long.';
    if (!TEL_REGEX.test(tel)) return 'Indicatif invalide — utilisez 70, 71, 75, 76, 77 ou 78.';
    return '';
}

function sexeLabel(cin) {
    if (!cin) return null;
    return cin.startsWith('2') ? 'Féminin' : 'Masculin';
}

function capitaliserPrenom(val) {
    if (!val) return '';
    return val.charAt(0).toUpperCase() + val.slice(1);
}

function slugifyLabel(label) {
    return label
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60);
}

function formatFileSize(bytes) {
    const kb = bytes / 1024;
    return kb >= 1024 ? (kb / 1024).toFixed(1) + ' Mo' : Math.round(kb) + ' Ko';
}

function typeLabel(t) {
    return { hopital: 'Hôpital', pharmacie: 'Pharmacie', clinique: 'Clinique', autre: 'Autre' }[t] ?? t;
}

export default function DemandesCreate({
    typesAide = [],
    periodes = [],
    prestataires = [],
    annees = [],
    regions = [],
}) {
    const [step, setStep] = useState(1);
    const [searching, setSearching] = useState(false);
    const [citoyenTrouve, setCitoyenTrouve] = useState(null);
    const [searchPrestataire, setSearchPrestataire] = useState('');
    const [selectedRegionId, setSelectedRegionId] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [eligibilite, setEligibilite] = useState({ checked: false, quota_atteint: false, periode_active: false, requiert_periode: false });
    const [filesDocuments, setFilesDocuments] = useState([]);

    const form = useForm({
        citoyen_id: null,
        cin: '', nom: '', prenom: '', telephone: '', adresse: '', commune_id: '',
        type_aide_id: '', evenement_id: '', annee_gestion_id: annees[0]?.id ?? '',
        periode_ouverture_id: '',
        prestataires: [],
        pieces_jointes: [],
    });

    const typeAideCode = typesAide.find((t) => t.id == form.data.type_aide_id)?.code ?? null;
    const documentsRequis = DOCUMENTS_PAR_TYPE[typeAideCode] ?? [
        { label: 'Document justificatif', requis: true },
    ];

    useEffect(() => {
        setFilesDocuments(new Array(documentsRequis.length).fill(null));
        form.setData('pieces_jointes', []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeAideCode]);

    // Résout la période d'ouverture active correspondant à l'événement + année sélectionnés,
    // sans quoi le backend ne peut jamais valider la soumission des types d'aide qui l'exigent.
    useEffect(() => {
        if (!form.data.evenement_id || !form.data.annee_gestion_id) {
            if (form.data.periode_ouverture_id) form.setData('periode_ouverture_id', '');
            return;
        }
        const periodeActive = periodes.find((p) =>
            String(p.evenement_id) === String(form.data.evenement_id) &&
            String(p.annee_gestion_id) === String(form.data.annee_gestion_id)
        );
        form.setData('periode_ouverture_id', periodeActive ? periodeActive.id : '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.evenement_id, form.data.annee_gestion_id]);

    const cinValide = form.data.cin.length >= 12 && form.data.cin.length <= 14 && /^[12]/.test(form.data.cin);

    const cinErreurLocale = (() => {
        const c = form.data.cin;
        if (!c) return '';
        if (!/^[12]/.test(c)) return 'Le CIN doit commencer par 1 ou 2.';
        if (c.length < 12) return `Trop court — ${12 - c.length} caractère(s) manquant(s).`;
        if (c.length > 14) return 'Le CIN ne peut pas dépasser 14 caractères.';
        return '';
    })();

    const prenomValide = form.data.prenom.length > 0 && /^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/.test(form.data.prenom);

    const evenementsFiltres = typesAide.find((t) => t.id == form.data.type_aide_id)?.evenements ?? [];

    const departementsDisponibles = regions.find((r) => r.id == selectedRegionId)?.departements ?? [];
    const communesDisponibles = departementsDisponibles.find((d) => d.id == selectedDeptId)?.communes ?? [];

    const dejaAjoutes = form.data.prestataires.map((p) => p.id);
    const prestatairesDisponibles = prestataires.filter((p) =>
        !dejaAjoutes.includes(p.id) &&
        (!searchPrestataire || p.nom.toLowerCase().includes(searchPrestataire.toLowerCase()))
    );

    const totalFormate = new Intl.NumberFormat('fr-FR').format(
        form.data.prestataires.reduce((s, p) => s + (p.montant_estime || 0), 0)
    );

    const canProceed = (() => {
        if (step === 1) return cinValide && (citoyenTrouve || (form.data.nom && form.data.prenom));
        if (step === 2) {
            if (!form.data.type_aide_id || !form.data.annee_gestion_id || eligibilite.quota_atteint) return false;
            if (eligibilite.requiert_periode && form.data.evenement_id && eligibilite.checked && !eligibilite.periode_active) return false;
            return true;
        }
        return true;
    })();

    const peutSoumettre = documentsRequis.every((doc, i) => !doc.requis || !!filesDocuments[i]);

    async function rechercherCitoyen() {
        if (!form.data.cin) return;
        setSearching(true);
        try {
            const res = await fetch(route('citoyens.search') + '?cin=' + encodeURIComponent(form.data.cin));
            const data = await res.json();
            setCitoyenTrouve(data);
            if (data) {
                form.setData((d) => ({ ...d, citoyen_id: data.id, nom: data.nom, prenom: data.prenom }));
            } else {
                form.setData('citoyen_id', null);
            }
        } finally {
            setSearching(false);
        }
    }

    function reinitialiserCitoyen() {
        setCitoyenTrouve(null);
        form.setData((d) => ({ ...d, citoyen_id: null, nom: '', prenom: '' }));
    }

    async function checkEligibilite(overrides = {}) {
        const type_aide_id = overrides.type_aide_id ?? form.data.type_aide_id;
        const annee_gestion_id = overrides.annee_gestion_id ?? form.data.annee_gestion_id;
        const evenement_id = overrides.evenement_id ?? form.data.evenement_id;
        const citoyen_id = form.data.citoyen_id;
        if (!type_aide_id || !annee_gestion_id || !citoyen_id) return;

        const params = new URLSearchParams({
            citoyen_id,
            type_aide_id,
            annee_gestion_id,
            ...(evenement_id ? { evenement_id } : {}),
        });

        const res = await fetch(route('demandes.eligibilite') + '?' + params);
        const data = await res.json();
        setEligibilite({ ...data, checked: true });
    }

    function nextStep() {
        if (!canProceed) return;
        setStep((s) => s + 1);
    }

    function ajouterPrestataire(p) {
        if (!form.data.prestataires.find((x) => x.id === p.id)) {
            form.setData('prestataires', [...form.data.prestataires, { id: p.id, montant_estime: 0 }]);
        }
        setSearchPrestataire('');
    }

    function updatePrestataireMontant(index, value) {
        const montant = value === '' ? 0 : Number(value);
        form.setData('prestataires', form.data.prestataires.map((p, i) => i === index ? { ...p, montant_estime: montant } : p));
    }

    function retirerPrestataire(index) {
        form.setData('prestataires', form.data.prestataires.filter((_, i) => i !== index));
    }

    function prestataireName(id) {
        return prestataires.find((p) => p.id === id)?.nom ?? '';
    }

    function onDocumentFile(index, e) {
        const raw = e.target.files?.[0] ?? null;
        if (!raw) return;
        const ext = raw.name.includes('.') ? raw.name.split('.').pop() : '';
        const nom = slugifyLabel(documentsRequis[index].label) + (ext ? '.' + ext : '');
        const file = new File([raw], nom, { type: raw.type });
        const updated = [...filesDocuments];
        updated[index] = file;
        setFilesDocuments(updated);
        form.setData('pieces_jointes', updated.filter(Boolean));
        e.target.value = '';
    }

    function removeDocument(index) {
        const updated = [...filesDocuments];
        updated[index] = null;
        setFilesDocuments(updated);
        form.setData('pieces_jointes', updated.filter(Boolean));
    }

    function sauvegarder(mode) {
        form.transform((data) => ({
            ...data,
            _soumettre_apres: mode === 'soumettre',
        }));
        form.post(route('demandes.store'), {
            forceFormData: true,
        });
    }

    return (
        <AppLayout title="Nouvelle demande">
            <div className="max-w-3xl mx-auto">
                {/* Header + stepper */}
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-gray-900 mb-5">Nouvelle demande de prise en charge</h1>
                    <div className="flex items-center gap-0">
                        {steps.map((s, i) => (
                            <div key={s.id} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center gap-1">
                                    <div className={[
                                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                                        step > s.id ? 'bg-green-600 text-white' :
                                            step === s.id ? 'bg-[#1B3A2D] text-white ring-4 ring-[#1B3A2D]/20' :
                                                'bg-gray-100 text-gray-400',
                                    ].join(' ')}>
                                        {step > s.id ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        ) : (
                                            <span>{s.id}</span>
                                        )}
                                    </div>
                                    <span className={['text-xs font-medium hidden sm:block', step >= s.id ? 'text-gray-800' : 'text-gray-400'].join(' ')}>{s.label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={['flex-1 h-0.5 mx-2 mb-5', step > s.id ? 'bg-green-500' : 'bg-gray-200'].join(' ')} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Étape 1 — Citoyen */}
                <div style={{ display: step === 1 ? undefined : 'none' }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Identification du citoyen</h2>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Numéro CIN <span className="text-red-500">*</span>
                            <span className="ml-2 text-xs font-normal text-gray-400">12–14 caractères, commence par 1 ou 2</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={form.data.cin}
                                onChange={(e) => form.setData('cin', e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                                type="text" placeholder="Ex : 1234567890123" maxLength={14}
                                className={[
                                    'flex-1 px-3 py-2.5 text-sm border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors',
                                    cinErreurLocale || form.errors.cin ? 'border-red-300 bg-red-50' : (form.data.cin && cinValide ? 'border-green-400' : 'border-gray-300'),
                                ].join(' ')} />
                            <button type="button" onClick={rechercherCitoyen} disabled={searching || !cinValide}
                                className={['px-4 py-2 text-sm font-medium rounded-lg transition-colors', cinValide ? 'bg-[#1B3A2D] text-white hover:bg-[#254d3c]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'].join(' ')}>
                                {searching ? '...' : 'Rechercher'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            {form.errors.cin || cinErreurLocale ? (
                                <p className="text-xs text-red-600">{form.errors.cin || cinErreurLocale}</p>
                            ) : form.data.cin && cinValide ? (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    Format valide
                                </p>
                            ) : (
                                <p className="text-xs text-transparent">.</p>
                            )}
                            <span className={['text-xs', form.data.cin.length > 14 ? 'text-red-500' : form.data.cin.length >= 12 ? 'text-green-600' : 'text-gray-400'].join(' ')}>
                                {form.data.cin.length}/14
                            </span>
                        </div>
                        {!citoyenTrouve && cinValide && (
                            <p className="mt-2 inline-block text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1"><span className="font-bold">Sexe</span> : <span className="font-medium text-gray-700">{sexeLabel(form.data.cin)}</span></p>
                        )}
                    </div>

                    {citoyenTrouve && (
                        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-green-800">{citoyenTrouve.prenom} {citoyenTrouve.nom}</p>
                                    <p className="text-xs text-green-600">CIN : {citoyenTrouve.cin} — {citoyenTrouve.sexe === 'f' ? 'Féminin' : 'Masculin'} — {citoyenTrouve.commune?.nom ?? 'Localité non renseignée'}</p>
                                </div>
                                <button onClick={reinitialiserCitoyen} className="text-xs text-green-700 hover:text-green-900 font-medium">Changer</button>
                            </div>
                        </div>
                    )}

                    {!citoyenTrouve && (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 italic">Citoyen non trouvé. Remplissez le formulaire pour créer sa fiche.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom <span className="text-red-500">*</span></label>
                                    <input value={form.data.prenom} type="text"
                                        onChange={(e) => form.setData('prenom', capitaliserPrenom(e.target.value))}
                                        className={[
                                            'w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
                                            form.errors.prenom ? 'border-red-300 bg-red-50' : (form.data.prenom && prenomValide ? 'border-green-400' : (form.data.prenom ? 'border-orange-300' : 'border-gray-300')),
                                        ].join(' ')} />
                                    {form.errors.prenom ? (
                                        <p className="mt-1 text-xs text-red-600">{form.errors.prenom}</p>
                                    ) : form.data.prenom && !prenomValide && (
                                        <p className="mt-1 text-xs text-orange-600">Le prénom doit commencer par une majuscule.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nom <span className="text-red-500">*</span>
                                        <span className="ml-1 text-xs font-normal text-gray-400">majuscules uniquement</span>
                                    </label>
                                    <input value={form.data.nom} type="text"
                                        onChange={(e) => form.setData('nom', e.target.value.toUpperCase())}
                                        className={[
                                            'w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
                                            form.errors.nom ? 'border-red-300 bg-red-50' : (form.data.nom ? 'border-green-400' : 'border-gray-300'),
                                        ].join(' ')} />
                                    {form.errors.nom && <p className="mt-1 text-xs text-red-600">{form.errors.nom}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Téléphone
                                        <span className="ml-1 text-xs font-normal text-gray-400">+221 7X XXX XX XX</span>
                                    </label>
                                    <input value={form.data.telephone} onChange={(e) => form.setData('telephone', e.target.value)}
                                        type="text" placeholder="+221770000000" maxLength={13}
                                        className={[
                                            'w-full px-3 py-2.5 text-sm border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 transition-colors',
                                            telErreurLocale(form.data.telephone) ? 'border-red-300 bg-red-50' : (form.data.telephone && telValide(form.data.telephone) ? 'border-green-400' : 'border-gray-300'),
                                        ].join(' ')} />
                                    {form.errors.telephone ? (
                                        <p className="mt-1 text-xs text-red-600">{form.errors.telephone}</p>
                                    ) : form.data.telephone && telErreurLocale(form.data.telephone) && (
                                        <p className="mt-1 text-xs text-red-600">{telErreurLocale(form.data.telephone)}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Région</label>
                                    <select value={selectedRegionId}
                                        onChange={(e) => { setSelectedRegionId(e.target.value); setSelectedDeptId(''); form.setData('commune_id', ''); }}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                                        <option value="">— Sélectionner —</option>
                                        {regions.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Département</label>
                                    <select value={selectedDeptId}
                                        onChange={(e) => { setSelectedDeptId(e.target.value); form.setData('commune_id', ''); }}
                                        disabled={!selectedRegionId}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 disabled:bg-gray-50">
                                        <option value="">— Sélectionner —</option>
                                        {departementsDisponibles.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Commune</label>
                                    <select value={form.data.commune_id} onChange={(e) => form.setData('commune_id', e.target.value)} disabled={!selectedDeptId}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 disabled:bg-gray-50">
                                        <option value="">— Sélectionner —</option>
                                        {communesDisponibles.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                                    <input value={form.data.adresse} onChange={(e) => form.setData('adresse', e.target.value)} type="text" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Étape 2 — Type d'aide */}
                <div style={{ display: step === 2 ? undefined : 'none' }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Type d'aide & événement</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Année de gestion <span className="text-red-500">*</span></label>
                            <select value={form.data.annee_gestion_id}
                                onChange={(e) => { form.setData('annee_gestion_id', e.target.value); checkEligibilite({ annee_gestion_id: e.target.value }); }}
                                className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.annee_gestion_id ? 'border-red-300' : 'border-gray-300'].join(' ')}>
                                <option value="">Sélectionner l'année...</option>
                                {annees.map((a) => <option key={a.id} value={a.id}>{a.annee}</option>)}
                            </select>
                            {form.errors.annee_gestion_id && <p className="mt-1 text-xs text-red-600">{form.errors.annee_gestion_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type d'aide <span className="text-red-500">*</span></label>
                            <select value={form.data.type_aide_id}
                                onChange={(e) => { form.setData((d) => ({ ...d, type_aide_id: e.target.value, evenement_id: '' })); checkEligibilite({ type_aide_id: e.target.value, evenement_id: '' }); }}
                                className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.type_aide_id ? 'border-red-300' : 'border-gray-300'].join(' ')}>
                                <option value="">Sélectionner un type...</option>
                                {typesAide.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                            </select>
                            {form.errors.type_aide_id && <p className="mt-1 text-xs text-red-600">{form.errors.type_aide_id}</p>}
                        </div>
                        {evenementsFiltres.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Événement</label>
                                <select value={form.data.evenement_id}
                                    onChange={(e) => { form.setData('evenement_id', e.target.value); checkEligibilite({ evenement_id: e.target.value }); }}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]">
                                    <option value="">— Aucun événement spécifique —</option>
                                    {evenementsFiltres.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                                </select>
                            </div>
                        )}

                        {eligibilite.quota_atteint && (
                            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                </svg>
                                <p className="text-sm text-red-700">Ce citoyen a atteint le quota de <strong>2 demandes</strong> pour ce type d'aide cette année.</p>
                            </div>
                        )}

                        {eligibilite.requiert_periode && form.data.evenement_id && eligibilite.checked && (
                            !eligibilite.periode_active ? (
                                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <svg className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="text-sm text-yellow-700">Aucune période d'ouverture active pour cet événement. La soumission est bloquée.</p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="text-sm text-green-700">Période d'ouverture active — la demande peut être soumise.</p>
                                </div>
                            )
                        )}

                        {form.data.type_aide_id && eligibilite.checked && !eligibilite.requiert_periode && (
                            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                </svg>
                                <p className="text-sm text-blue-700">Ce type d'aide est disponible à tout moment — aucune période d'ouverture requise.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Étape 3 — Prestataires */}
                <div style={{ display: step === 3 ? undefined : 'none' }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Prestataires & montants</h2>
                    <p className="text-xs text-gray-500 mb-4">Sélectionnez un ou plusieurs prestataires et indiquez le montant estimé pour chacun.</p>

                    {form.data.prestataires.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {form.data.prestataires.map((p, i) => (
                                <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{prestataireName(p.id)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input value={p.montant_estime} onChange={(e) => updatePrestataireMontant(i, e.target.value)}
                                            type="number" min="0" placeholder="Montant (FCFA)"
                                            className="w-36 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                                        <button onClick={() => retirerPrestataire(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <p className="text-sm font-semibold text-gray-800">Total estimé : {totalFormate} FCFA</p>
                            </div>
                        </div>
                    )}

                    <div className="border border-dashed border-gray-300 rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-500 mb-3">Ajouter un prestataire</p>
                        <div className="relative mb-2">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input value={searchPrestataire} onChange={(e) => setSearchPrestataire(e.target.value)} type="text" placeholder="Rechercher un prestataire..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {prestatairesDisponibles.map((p) => (
                                <button key={p.id} type="button" onClick={() => ajouterPrestataire(p)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-[#1B3A2D]/5 text-left transition-colors">
                                    <span className="font-medium text-gray-800">{p.nom}</span>
                                    <span className="text-xs text-gray-400">{typeLabel(p.type)}</span>
                                </button>
                            ))}
                            {!prestatairesDisponibles.length && <p className="text-xs text-gray-400 text-center py-3">Aucun prestataire disponible.</p>}
                        </div>
                    </div>
                </div>

                {/* Étape 4 — Pièces jointes */}
                <div style={{ display: step === 4 ? undefined : 'none' }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-1">Pièces justificatives</h2>
                    <p className="text-xs text-gray-500 mb-5">Fournissez chaque document requis. Formats acceptés : PDF, JPG, PNG — max 100 Mo par fichier.</p>

                    <div className="space-y-3">
                        {documentsRequis.map((doc, i) => (
                            <div key={i} className={['border rounded-xl p-4 transition-colors', filesDocuments[i] ? 'border-green-200 bg-green-50/20' : 'border-gray-200'].join(' ')}>
                                <div className="flex items-start gap-3">
                                    <div className={['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors', filesDocuments[i] ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'].join(' ')}>
                                        {filesDocuments[i] ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        ) : (
                                            <span>{i + 1}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 mb-2">
                                            {doc.label}
                                            {doc.requis && <span className="text-red-500 ml-0.5">*</span>}
                                        </p>

                                        {filesDocuments[i] && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-lg mb-2">
                                                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                                </svg>
                                                <span className="text-xs text-gray-700 truncate flex-1">{filesDocuments[i].name}</span>
                                                <span className="text-xs text-gray-400 shrink-0">{formatFileSize(filesDocuments[i].size)}</span>
                                                <button type="button" onClick={() => removeDocument(i)} className="ml-1 p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        <label className={[
                                            'block border border-dashed rounded-lg px-4 py-2.5 cursor-pointer text-center transition-colors',
                                            filesDocuments[i] ? 'border-green-300 hover:border-green-400 hover:bg-green-50/30' : 'border-gray-300 hover:border-[#1B3A2D] hover:bg-[#1B3A2D]/5',
                                        ].join(' ')}>
                                            <p className="text-xs text-gray-500">
                                                {filesDocuments[i] ? 'Remplacer le fichier' : 'Cliquez pour sélectionner'}
                                            </p>
                                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => onDocumentFile(i, e)} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {documentsRequis.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <span>{form.data.pieces_jointes.length} / {documentsRequis.filter((d) => d.requis).length} document(s) requis fournis</span>
                            {peutSoumettre && (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    </svg>
                                    Dossier complet
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                    {step > 1 ? (
                        <button onClick={() => setStep((s) => s - 1)} type="button"
                            className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            Retour
                        </button>
                    ) : <div />}

                    <div className="flex gap-3">
                        {step === 4 && (
                            <button type="button" onClick={() => sauvegarder('brouillon')} disabled={form.processing}
                                className="px-5 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60">
                                Sauvegarder
                            </button>
                        )}

                        {step < 4 ? (
                            <button onClick={nextStep} type="button" disabled={!canProceed}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] transition-colors disabled:opacity-40">
                                Suivant
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                        ) : (
                            <button type="button" onClick={() => sauvegarder('soumettre')} disabled={form.processing || !peutSoumettre}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] transition-colors disabled:opacity-40">
                                {form.processing ? <span>Envoi...</span> : <span>Enregistrer & soumettre</span>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
