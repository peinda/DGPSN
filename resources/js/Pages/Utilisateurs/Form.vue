<template>
    <AppLayout :title="isEdit ? 'Modifier un compte' : 'Nouveau compte'">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
            <Link href="/utilisateurs" class="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
            </Link>
            <div>
                <h1 class="text-2xl font-bold text-gray-900">
                    {{ isEdit ? 'Modifier le compte' : 'Nouveau compte' }}
                </h1>
                <p class="text-sm text-gray-500 mt-0.5">
                    {{ isEdit ? `Modification de ${user.name}` : 'Créer un compte utilisateur' }}
                </p>
            </div>
        </div>

        <div class="max-w-xl">
            <form @submit.prevent="submit" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">

                <!-- Nom -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                    <input
                        v-model="form.name"
                        type="text"
                        placeholder="Ex : Mamadou Diallo"
                        :class="inputClass(form.errors.name)"
                    />
                    <p v-if="form.errors.name" class="mt-1 text-xs text-red-600">{{ form.errors.name }}</p>
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                    <input
                        v-model="form.email"
                        type="email"
                        placeholder="exemple@dgpsn.sn"
                        :class="inputClass(form.errors.email)"
                    />
                    <p v-if="form.errors.email" class="mt-1 text-xs text-red-600">{{ form.errors.email }}</p>
                </div>

                <!-- Rôle -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Rôle</label>
                    <select v-model="form.role" :class="inputClass(form.errors.role)">
                        <option value="" disabled>Sélectionner un rôle</option>
                        <option v-for="r in roles" :key="r" :value="r">{{ roleLabel(r) }}</option>
                    </select>
                    <p v-if="form.errors.role" class="mt-1 text-xs text-red-600">{{ form.errors.role }}</p>

                    <!-- Description du rôle -->
                    <div v-if="form.role" class="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p class="text-xs text-gray-600">
                            <span class="font-semibold">{{ roleLabel(form.role) }} :</span>
                            {{ roleDesc[form.role] }}
                        </p>
                    </div>
                </div>

                <!-- Séparateur -->
                <div class="border-t border-gray-100 pt-1">
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                        {{ isEdit ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe' }}
                    </p>

                    <!-- Mot de passe -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                        <div class="relative">
                            <input
                                v-model="form.password"
                                :type="showPwd ? 'text' : 'password'"
                                placeholder="••••••••"
                                :class="inputClass(form.errors.password) + ' pr-10'"
                            />
                            <button type="button" @click="showPwd = !showPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path v-if="!showPwd" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                </svg>
                            </button>
                        </div>
                        <p v-if="form.errors.password" class="mt-1 text-xs text-red-600">{{ form.errors.password }}</p>
                    </div>

                    <!-- Confirmation -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                        <input
                            v-model="form.password_confirmation"
                            :type="showPwd ? 'text' : 'password'"
                            placeholder="••••••••"
                            :class="inputClass(null)"
                        />
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                    >
                        <svg v-if="form.processing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        {{ isEdit ? 'Enregistrer les modifications' : 'Créer le compte' }}
                    </button>
                    <Link href="/utilisateurs" class="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                        Annuler
                    </Link>
                </div>
            </form>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link, useForm } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({
    user:  { type: Object, default: null },
    roles: Array,
});

const isEdit = computed(() => !!props.user);
const showPwd = ref(false);

const form = useForm({
    name:                 props.user?.name  ?? '',
    email:                props.user?.email ?? '',
    role:                 props.user?.role  ?? '',
    password:             '',
    password_confirmation:'',
});

const roleLabels = { administrateur: 'Administrateur', agent: 'Agent', comite: 'Comité' };
const roleDesc   = {
    administrateur: 'Accès complet : référentiels, utilisateurs, rapports, demandes.',
    agent:          'Instruit les dossiers : crée, modifie et soumet les demandes au nom du citoyen.',
    comite:         'Examine les dossiers soumis et statue : approuve ou rejette les demandes.',
};
function roleLabel(r) { return roleLabels[r] ?? r; }

function inputClass(error) {
    return [
        'w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]',
        error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400',
    ].join(' ');
}

function submit() {
    if (isEdit.value) {
        form.put(`/utilisateurs/${props.user.id}`, {
            onSuccess: () => form.reset('password', 'password_confirmation'),
        });
    } else {
        form.post('/utilisateurs', {
            onSuccess: () => form.reset(),
        });
    }
}
</script>
