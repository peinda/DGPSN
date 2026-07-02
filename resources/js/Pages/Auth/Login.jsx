import { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';

const features = [
    { text: 'Gestion centralisée des demandes sociales' },
    { text: 'Suivi en temps réel des dossiers' },
    { text: 'Génération automatique des bons PDF' },
    { text: 'Tableaux de bord et statistiques' },
];

export default function Login() {
    const { props } = usePage();
    const status = props.flash?.status ?? null;

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
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
                    <p className="text-white/70 text-sm mb-10 leading-relaxed">
                        Délégation Générale à la Protection Sociale<br />et à la Solidarité Nationale
                    </p>

                    <div className="space-y-4 text-left max-w-xs mx-auto">
                        {features.map((item) => (
                            <div key={item.text} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>
                                <span className="text-white/80 text-sm">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-6 text-white/30 text-xs">
                    © {new Date().getFullYear()} DGPSN — République du Sénégal
                </div>
            </div>

            {/* Panneau droit — formulaire */}
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

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
                    <p className="text-sm text-gray-500 mb-8">Accédez à votre espace de gestion sociale.</p>

                    {errors.email && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-sm text-red-700">{errors.email}</span>
                        </div>
                    )}

                    {status && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-sm text-green-700">{status}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Adresse email
                            </label>
                            <input
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                type="email"
                                autoComplete="email"
                                placeholder="exemple@dgpsn.sn"
                                className={[
                                    'w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
                                    errors.email
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300 bg-white hover:border-gray-400',
                                ].join(' ')}
                            />
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className={[
                                        'w-full px-4 py-2.5 pr-10 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
                                        errors.password
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400',
                                    ].join(' ')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
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

                        {/* Se souvenir + mot de passe oublié */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    id="remember"
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-[#1B3A2D] focus:ring-[#1B3A2D]"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Se souvenir de moi</label>
                            </div>
                            <Link href={route('password.request')} className="text-sm text-[#1B3A2D] hover:underline">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        {/* Bouton */}
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
                            {processing ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    {/* Crédentiels de test */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">Comptes de test :</p>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">Admin :</span> admin@dgpsn.sn / dgpsn2025
                            </p>
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">Agent :</span> agent@dgpsn.sn / dgpsn2025
                            </p>
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">Comité :</span> comite@dgpsn.sn / dgpsn2025
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
