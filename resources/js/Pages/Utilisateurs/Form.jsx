import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout.jsx';

const roleLabels = { administrateur: 'Administrateur', agent: 'Agent', comite: 'Comité' };
const roleDesc = {
    administrateur: 'Accès complet : référentiels, utilisateurs, rapports, demandes.',
    agent: 'Instruit les dossiers : crée, modifie et soumet les demandes au nom du citoyen.',
    comite: 'Examine les dossiers soumis et statue : approuve ou rejette les demandes.',
};
function roleLabel(r) { return roleLabels[r] ?? r; }

function inputClass(error) {
    return [
        'w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
        error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400',
    ].join(' ');
}

export default function UtilisateursForm({ user = null, roles = [] }) {
    const isEdit = !!user;
    const [showPwd, setShowPwd] = useState(false);

    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        if (isEdit) {
            form.put(`/utilisateurs/${user.id}`, {
                onSuccess: () => form.reset('password', 'password_confirmation'),
            });
        } else {
            form.post('/utilisateurs', {
                onSuccess: () => form.reset(),
            });
        }
    }

    return (
        <AppLayout title={isEdit ? 'Modifier un compte' : 'Nouveau compte'}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/utilisateurs" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Modifier le compte' : 'Nouveau compte'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {isEdit ? `Modification de ${user.name}` : 'Créer un compte utilisateur'}
                    </p>
                </div>
            </div>

            <div className="max-w-xl">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                    {/* Nom */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                        <input
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            type="text"
                            placeholder="Ex : Mamadou Diallo"
                            className={inputClass(form.errors.name)}
                        />
                        {form.errors.name && <p className="mt-1 text-xs text-red-600">{form.errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                        <input
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            type="email"
                            placeholder="exemple@dgpsn.sn"
                            className={inputClass(form.errors.email)}
                        />
                        {form.errors.email && <p className="mt-1 text-xs text-red-600">{form.errors.email}</p>}
                    </div>

                    {/* Rôle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Rôle</label>
                        <select value={form.data.role} onChange={(e) => form.setData('role', e.target.value)} className={inputClass(form.errors.role)}>
                            <option value="" disabled>Sélectionner un rôle</option>
                            {roles.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                        </select>
                        {form.errors.role && <p className="mt-1 text-xs text-red-600">{form.errors.role}</p>}

                        {form.data.role && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-600">
                                    <span className="font-semibold">{roleLabel(form.data.role)} :</span>
                                    {' '}{roleDesc[form.data.role]}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Séparateur */}
                    <div className="border-t border-gray-100 pt-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                            {isEdit ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                        </p>

                        {/* Mot de passe */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                            <div className="relative">
                                <input
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={inputClass(form.errors.password) + ' pr-10'}
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {!showPwd ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {form.errors.password && <p className="mt-1 text-xs text-red-600">{form.errors.password}</p>}
                        </div>

                        {/* Confirmation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                            <input
                                value={form.data.password_confirmation}
                                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                type={showPwd ? 'text' : 'password'}
                                placeholder="••••••••"
                                className={inputClass(null)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                        >
                            {form.processing && (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                            )}
                            {isEdit ? 'Enregistrer les modifications' : 'Créer le compte'}
                        </button>
                        <Link href="/utilisateurs" className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                            Annuler
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
