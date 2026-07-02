import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort'];
const strengthTextColors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600'];

export default function ResetPassword({ token, email = '' }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const confirmMismatch =
        data.password_confirmation.length > 0 && data.password !== data.password_confirmation;

    const passwordStrength = (() => {
        const p = data.password;
        if (!p) return 0;
        let score = 0;
        if (p.length >= 8) score++;
        if (p.length >= 12) score++;
        if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
        if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
        return score;
    })();

    const strengthLabel = strengthLabels[passwordStrength - 1] ?? 'Très faible';
    const strengthTextColor = strengthTextColors[passwordStrength - 1] ?? 'text-red-600';

    function strengthColor(i) {
        return i <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200';
    }

    function submit(e) {
        e.preventDefault();
        post(route('password.update'));
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Panneau gauche — branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1B3A2D] flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute top-1/3 right-8 w-32 h-32 bg-[#F5A623]/10 rounded-full" />

                <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center mx-auto mb-4">
                        <div className="w-52 h-52 rounded-full bg-white overflow-hidden shadow-2xl">
                            <img src="/images/logo.png" alt="Logo DGPSN" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">DGPSN</h1>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Délégation Générale à la Protection Sociale<br />et à la Solidarité Nationale
                    </p>
                </div>

                <div className="absolute bottom-6 text-white/30 text-xs">
                    © {new Date().getFullYear()} DGPSN — République du Sénégal
                </div>
            </div>

            {/* Panneau droit */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Logo mobile */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md overflow-hidden p-1">
                            <img src="/images/logo.png" alt="Logo DGPSN" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">DGPSN</p>
                            <p className="text-xs text-gray-500 leading-tight">Plateforme de Gestion Sociale</p>
                        </div>
                    </div>

                    {/* Icône */}
                    <div className="w-12 h-12 rounded-xl bg-[#1B3A2D]/10 flex items-center justify-center mb-6">
                        <svg className="w-6 h-6 text-[#1B3A2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Nouveau mot de passe</h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Choisissez un mot de passe sécurisé d'au moins 8 caractères.
                    </p>

                    {errors.email && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-sm text-red-700">{errors.email}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Email (pré-rempli, readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                            <input
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                type="email"
                                autoComplete="email"
                                readOnly
                                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Nouveau mot de passe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
                            <div className="relative">
                                <input
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    autoFocus
                                    className={[
                                        'w-full px-4 py-2.5 pr-10 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
                                        errors.password
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400',
                                    ].join(' ')}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {!showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>

                        {/* Confirmation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                            <div className="relative">
                                <input
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    type={showConfirm ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className={[
                                        'w-full px-4 py-2.5 pr-10 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
                                        confirmMismatch
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400',
                                    ].join(' ')}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {!showConfirm ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {confirmMismatch && <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas.</p>}
                        </div>

                        {/* Indicateur de force */}
                        {data.password && (
                            <div className="space-y-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className={['h-1 flex-1 rounded-full transition-colors', strengthColor(i)].join(' ')} />
                                    ))}
                                </div>
                                <p className={['text-xs', strengthTextColor].join(' ')}>{strengthLabel}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#1B3A2D] hover:bg-[#254d3c] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {processing && (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                            )}
                            {processing ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href={route('login')} className="text-sm text-[#1B3A2D] hover:underline font-medium inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
