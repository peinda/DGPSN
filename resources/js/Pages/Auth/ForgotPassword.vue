<template>
    <div class="min-h-screen bg-gray-50 flex">
        <!-- Panneau gauche — branding -->
        <div class="hidden lg:flex lg:w-1/2 bg-[#1B3A2D] flex-col items-center justify-center p-12 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div class="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div class="absolute top-1/3 right-8 w-32 h-32 bg-[#F5A623]/10 rounded-full" />

            <div class="relative z-10 text-center">
                <div class="flex items-center justify-center mx-auto mb-4">
                    <div class="w-52 h-52 rounded-full bg-white overflow-hidden shadow-2xl">
                        <img src="/images/logo.png" alt="Logo DGPSN" class="w-full h-full object-cover" />
                    </div>
                </div>
                <h1 class="text-3xl font-bold text-white mb-2">DGPSN</h1>
                <p class="text-white/70 text-sm leading-relaxed">
                    Délégation Générale à la Protection Sociale<br/>et à la Solidarité Nationale
                </p>
            </div>

            <div class="absolute bottom-6 text-white/30 text-xs">
                © {{ new Date().getFullYear() }} DGPSN — République du Sénégal
            </div>
        </div>

        <!-- Panneau droit -->
        <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
            <div class="w-full max-w-md">
                <!-- Logo mobile -->
                <div class="flex items-center gap-3 mb-8 lg:hidden">
                    <div class="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md overflow-hidden p-1">
                        <img src="/images/logo.png" alt="Logo DGPSN" class="w-full h-full object-contain" />
                    </div>
                    <div>
                        <p class="font-bold text-gray-900 text-sm">DGPSN</p>
                        <p class="text-xs text-gray-500 leading-tight">Plateforme de Gestion Sociale</p>
                    </div>
                </div>

                <!-- Icône -->
                <div class="w-12 h-12 rounded-xl bg-[#1B3A2D]/10 flex items-center justify-center mb-6">
                    <svg class="w-6 h-6 text-[#1B3A2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                </div>

                <h2 class="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié ?</h2>
                <p class="text-sm text-gray-500 mb-8">
                    Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                <!-- Message de succès -->
                <div v-if="status" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                        <p class="text-sm font-medium text-green-800">Email envoyé !</p>
                        <p class="text-sm text-green-700 mt-0.5">
                            Si un compte correspond à cette adresse, vous recevrez un lien de réinitialisation dans quelques minutes.
                        </p>
                    </div>
                </div>

                <form v-if="!status" @submit.prevent="submit" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">
                            Adresse email
                        </label>
                        <input
                            v-model="form.email"
                            type="email"
                            autocomplete="email"
                            placeholder="exemple@dgpsn.sn"
                            autofocus
                            :class="[
                                'w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
                                form.errors.email
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300 bg-white hover:border-gray-400'
                            ]"
                        />
                        <p v-if="form.errors.email" class="mt-1 text-xs text-red-600">{{ form.errors.email }}</p>
                    </div>

                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="w-full bg-[#1B3A2D] hover:bg-[#254d3c] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <svg v-if="form.processing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        {{ form.processing ? 'Envoi en cours...' : 'Envoyer le lien' }}
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <Link :href="route('login')" class="text-sm text-[#1B3A2D] hover:underline font-medium inline-flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Link, useForm, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const page = usePage();
const status = computed(() => page.props.flash?.status ?? null);

const form = useForm({ email: '' });

function submit() {
    form.post(route('password.email'));
}
</script>
