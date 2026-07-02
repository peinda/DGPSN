import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';
import Modal from '@/Components/UI/Modal.jsx';
import FlashMessage from '@/Components/UI/FlashMessage.jsx';

const types = [
    { value: 'hopital', label: 'Hôpital' },
    { value: 'pharmacie', label: 'Pharmacie' },
    { value: 'clinique', label: 'Clinique' },
    { value: 'autre', label: 'Autre' },
];

function typeLabel(t) { return types.find((x) => x.value === t)?.label ?? t; }
function typeClass(t) {
    return {
        hopital: 'bg-blue-100 text-blue-700',
        pharmacie: 'bg-green-100 text-green-700',
        clinique: 'bg-purple-100 text-purple-700',
        autre: 'bg-gray-100 text-gray-600',
    }[t] ?? 'bg-gray-100 text-gray-600';
}

const defaultPrestataires = { data: [], links: [], total: 0, last_page: 1 };

export default function PrestatairesIndex({ prestataires = defaultPrestataires, regions = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [filterType, setFilterType] = useState(filters.type ?? '');
    const [filterActif, setFilterActif] = useState(filters.actif ?? '');

    function applySearch(overrides = {}) {
        const s = overrides.search ?? search;
        const t = overrides.type ?? filterType;
        const a = overrides.actif ?? filterActif;
        router.get(route('referentiels.prestataires.index'), {
            search: s || undefined,
            type: t || undefined,
            actif: a !== '' ? a : undefined,
        }, { preserveState: true, replace: true });
    }

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const form = useForm({ nom: '', type: '', adresse: '', telephone: '', email: '', region_id: '', departement_id: '', commune_id: '', actif: true });

    const departementsFiltres = regions.find((r) => r.id == form.data.region_id)?.departements ?? [];
    const communesFiltrees = departementsFiltres.find((d) => d.id == form.data.departement_id)?.communes ?? [];

    function openModal(p = null) {
        setEditing(p);
        if (p) {
            form.setData({
                nom: p.nom, type: p.type, adresse: p.adresse ?? '', telephone: p.telephone ?? '',
                email: p.email ?? '', region_id: p.region_id ?? '', departement_id: p.departement_id ?? '',
                commune_id: p.commune_id ?? '', actif: p.actif,
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
            form.put(route('referentiels.prestataires.update', editing.id), opts);
        } else {
            form.post(route('referentiels.prestataires.store'), opts);
        }
    }

    function toggle(p) {
        router.patch(route('referentiels.prestataires.toggle', p.id), {}, { preserveScroll: true });
    }

    const [showDelete, setShowDelete] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const deleteForm = useForm({});

    function confirmDel(p) { setDeletingItem(p); setShowDelete(true); }
    function execDelete() {
        deleteForm.delete(route('referentiels.prestataires.destroy', deletingItem.id), {
            onSuccess: () => setShowDelete(false),
        });
    }

    return (
        <AppLayout title="Prestataires">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Prestataires agréés</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Hôpitaux, pharmacies et cliniques habilités à recevoir les bénéficiaires.</p>
                </div>
                <button onClick={() => openModal()} className="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Ajouter
                </button>
            </div>

            <FlashMessage />

            {/* Filtres */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-48">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyUp={(e) => { if (e.key === 'Enter') applySearch(); }} type="text" placeholder="Rechercher un prestataire..."
                        className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                    {search && (
                        <button onClick={() => { setSearch(''); applySearch({ search: '' }); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    )}
                </div>
                <select value={filterType} onChange={(e) => { setFilterType(e.target.value); applySearch({ type: e.target.value }); }} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                    <option value="">Tous les types</option>
                    {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select value={filterActif} onChange={(e) => { setFilterActif(e.target.value); applySearch({ actif: e.target.value }); }} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                    <option value="">Tous les statuts</option>
                    <option value="1">Actifs</option>
                    <option value="0">Inactifs</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-3 font-medium">Nom</th>
                            <th className="text-left px-4 py-3 font-medium">Type</th>
                            <th className="text-left px-4 py-3 font-medium">Téléphone</th>
                            <th className="text-left px-4 py-3 font-medium">Localité</th>
                            <th className="text-left px-4 py-3 font-medium">Statut</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prestataires.data.map((p) => (
                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-medium text-gray-900">{p.nom}</td>
                                <td className="px-4 py-3">
                                    <span className={[typeClass(p.type), 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'].join(' ')}>
                                        {typeLabel(p.type)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{p.telephone ?? '—'}</td>
                                <td className="px-4 py-3 text-gray-600 text-xs">
                                    {p.commune ? p.commune.nom : p.departement ? p.departement.nom : p.region ? p.region.nom : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggle(p)} className={[p.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500', 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity'].join(' ')}>
                                        {p.actif ? 'Actif' : 'Inactif'}
                                    </button>
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openModal(p)} className="text-xs text-blue-600 hover:underline font-medium">Modifier</button>
                                        <button onClick={() => confirmDel(p)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!prestataires.data?.length && (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">Aucun prestataire trouvé.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {prestataires.last_page > 1 && (
                    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">{prestataires.total} prestataire(s)</p>
                        <div className="flex gap-1">
                            {prestataires.links.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.url ?? ''}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={[link.active ? 'bg-[#1B3A2D] text-white' : 'text-gray-600 hover:bg-gray-100', !link.url ? 'opacity-40 pointer-events-none' : '', 'px-3 py-1.5 text-xs rounded-lg transition-colors'].join(' ')}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Create/Edit */}
            <Modal show={showModal} title={editing ? 'Modifier le prestataire' : 'Nouveau prestataire'} size="xl" onClose={() => setShowModal(false)}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={submit} disabled={form.processing} className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                            {form.processing ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Ajouter')}
                        </button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                            <input value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} type="text" className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.nom ? 'border-red-300' : 'border-gray-300'].join(' ')} />
                            {form.errors.nom && <p className="mt-1 text-xs text-red-600">{form.errors.nom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type <span className="text-red-500">*</span></label>
                            <select value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} className={['w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]', form.errors.type ? 'border-red-300' : 'border-gray-300'].join(' ')}>
                                <option value="">Sélectionner...</option>
                                {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            {form.errors.type && <p className="mt-1 text-xs text-red-600">{form.errors.type}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                            <input value={form.data.telephone} onChange={(e) => form.setData('telephone', e.target.value)} type="text" placeholder="77 000 00 00" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                            {form.errors.telephone && <p className="mt-1 text-xs text-red-600">{form.errors.telephone}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} type="email" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                            <input value={form.data.adresse} onChange={(e) => form.setData('adresse', e.target.value)} type="text" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Région</label>
                            <select value={form.data.region_id} onChange={(e) => form.setData((d) => ({ ...d, region_id: e.target.value, departement_id: '', commune_id: '' }))} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                                <option value="">Toutes les régions</option>
                                {regions.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Département</label>
                            <select value={form.data.departement_id} onChange={(e) => form.setData((d) => ({ ...d, departement_id: e.target.value, commune_id: '' }))} disabled={!form.data.region_id} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 disabled:bg-gray-50">
                                <option value="">Tous les départements</option>
                                {departementsFiltres.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Commune</label>
                            <select value={form.data.commune_id} onChange={(e) => form.setData('commune_id', e.target.value)} disabled={!form.data.departement_id} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 disabled:bg-gray-50">
                                <option value="">Toutes les communes</option>
                                {communesFiltrees.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2 flex items-center gap-3">
                            <input type="checkbox" checked={form.data.actif} onChange={(e) => form.setData('actif', e.target.checked)} id="prest-actif" className="w-4 h-4 rounded border-gray-300 text-[#1B3A2D]" />
                            <label htmlFor="prest-actif" className="text-sm text-gray-700">Prestataire actif</label>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Modal Suppression */}
            <Modal show={showDelete} title="Supprimer le prestataire" size="sm" onClose={() => setShowDelete(false)}
                footer={
                    <>
                        <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button onClick={execDelete} disabled={deleteForm.processing} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
                            {deleteForm.processing ? 'Suppression...' : 'Supprimer'}
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-600">Voulez-vous supprimer <strong>{deletingItem?.nom}</strong> ? Cette action est irréversible.</p>
            </Modal>
        </AppLayout>
    );
}
