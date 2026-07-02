import { Link, useForm, usePage } from '@inertiajs/react';

export default function ForgotPassword() {
    const { props } = usePage();
    const status = props.flash?.status ?? null;

    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post(route('password.email'));
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié ?</h2>
                    <p className="text-sm text-gray-500 mb-8">
                        Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>

                    {status && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-green-800">Email envoyé !</p>
                                <p className="text-sm text-green-700 mt-0.5">
                                    Si un compte correspond à cette adresse, vous recevrez un lien de réinitialisation dans quelques minutes.
                                </p>
                            </div>
                        </div>
                    )}

                    {!status && (
                        <form onSubmit={submit} className="space-y-4">
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
                                    autoFocus
                                    className={[
                                        'w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
                                        errors.email
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400',
                                    ].join(' ')}
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>

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
                                {processing ? 'Envoi en cours...' : 'Envoyer le lien'}
                            </button>
                        </form>
                    )}

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
