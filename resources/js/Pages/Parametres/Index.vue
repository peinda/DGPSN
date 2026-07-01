<template>
    <AppLayout title="Paramètres">
        <div class="max-w-3xl mx-auto">

            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-xl font-bold text-gray-900">Paramètres</h1>
                <p class="text-sm text-gray-500 mt-0.5">Gérez votre profil et la configuration de l'application.</p>
            </div>

            <FlashMessage />

            <!-- Onglets -->
            <div class="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                    :class="activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                    class="px-4 py-2 text-sm font-medium rounded-md transition-all">
                    {{ tab.label }}
                </button>
            </div>

            <!-- ===== Onglet Profil ===== -->
            <div v-show="activeTab === 'profil'" class="space-y-5">

                <!-- Carte identité -->
                <div class="bg-[#1B3A2D] rounded-xl p-6 flex items-center gap-5">
                    <div class="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-white/30">
                        {{ initiales }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-lg font-bold text-white truncate">{{ userData.name }}</p>
                        <p class="text-sm text-white/70 truncate">{{ userData.email }}</p>
                        <div class="flex items-center gap-3 mt-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                                {{ roleLabel }}
                            </span>
                            <span class="text-xs text-white/50">Membre depuis le {{ userData.created_at }}</span>
                        </div>
                    </div>
                </div>

                <!-- Formulaire profil -->
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 class="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Informations du profil
                    </h2>
                    <form @submit.prevent="sauvegarderProfil" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom complet <span class="text-red-500">*</span></label>
                            <input v-model="profilForm.name" type="text" placeholder="Votre nom complet"
                                class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors"
                                :class="profilForm.errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'" />
                            <p v-if="profilForm.errors.name" class="mt-1 text-xs text-red-600">{{ profilForm.errors.name }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse email <span class="text-red-500">*</span></label>
                            <input v-model="profilForm.email" type="email" placeholder="votre@email.com"
                                class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors"
                                :class="profilForm.errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'" />
                            <p v-if="profilForm.errors.email" class="mt-1 text-xs text-red-600">{{ profilForm.errors.email }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Rôle</label>
                            <input type="text" :value="roleLabel" disabled
                                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                            <p class="mt-1 text-xs text-gray-400">Le rôle est géré par l'administrateur.</p>
                        </div>
                        <div class="flex items-center justify-between pt-2">
                            <p v-if="profilForm.recentlySuccessful" class="text-sm text-green-600 font-medium flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                                Profil sauvegardé
                            </p>
                            <span v-else />
                            <button type="submit" :disabled="profilForm.processing"
                                class="px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-60">
                                {{ profilForm.processing ? 'Enregistrement...' : 'Sauvegarder' }}
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Mot de passe -->
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 class="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        Changer le mot de passe
                    </h2>
                    <form @submit.prevent="changerMotDePasse" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel <span class="text-red-500">*</span></label>
                            <input v-model="mdpForm.current_password" type="password" placeholder="••••••••"
                                class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors"
                                :class="mdpForm.errors.current_password ? 'border-red-300 bg-red-50' : 'border-gray-300'" />
                            <p v-if="mdpForm.errors.current_password" class="mt-1 text-xs text-red-600">{{ mdpForm.errors.current_password }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe <span class="text-red-500">*</span></label>
                            <input v-model="mdpForm.password" type="password" placeholder="••••••••"
                                class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors"
                                :class="mdpForm.errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'" />
                            <p v-if="mdpForm.errors.password" class="mt-1 text-xs text-red-600">{{ mdpForm.errors.password }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le nouveau mot de passe <span class="text-red-500">*</span></label>
                            <input v-model="mdpForm.password_confirmation" type="password" placeholder="••••••••"
                                class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors" />
                        </div>
                        <div class="flex items-center justify-between pt-2">
                            <p v-if="mdpForm.recentlySuccessful" class="text-sm text-green-600 font-medium flex items-center gap-1">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                                Mot de passe modifié
                            </p>
                            <span v-else />
                            <button type="submit" :disabled="mdpForm.processing"
                                class="px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-60">
                                {{ mdpForm.processing ? 'Modification...' : 'Changer le mot de passe' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ===== Onglet Types d'aide ===== -->
            <div v-show="activeTab === 'types-aide'">
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <!-- Header table -->
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div>
                            <p class="text-sm font-semibold text-gray-800">Types d'aide sociale</p>
                            <p class="text-xs text-gray-500 mt-0.5">Catégories d'aide gérées par la DGPSN.</p>
                        </div>
                        <button @click="ouvrirCreation"
                            class="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            Nouveau type
                        </button>
                    </div>

                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                                <th class="text-left px-5 py-3 font-medium">Nom</th>
                                <th class="text-left px-4 py-3 font-medium">Code</th>
                                <th class="text-left px-4 py-3 font-medium">Description</th>
                                <th class="text-center px-4 py-3 font-medium">Demandes</th>
                                <th class="text-center px-4 py-3 font-medium">Statut</th>
                                <th class="text-right px-5 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="type in typesAide" :key="type.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td class="px-5 py-3 font-medium text-gray-900">{{ type.nom }}</td>
                                <td class="px-4 py-3 font-mono text-xs text-gray-600 bg-gray-50/50">{{ type.code }}</td>
                                <td class="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{{ type.description ?? '—' }}</td>
                                <td class="px-4 py-3 text-center">
                                    <span class="text-sm font-semibold text-gray-700">{{ type.demandes_count }}</span>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <button @click="toggleActif(type)"
                                        :class="type.actif ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors">
                                        <span :class="type.actif ? 'bg-green-500' : 'bg-gray-400'" class="w-1.5 h-1.5 rounded-full"></span>
                                        {{ type.actif ? 'Actif' : 'Inactif' }}
                                    </button>
                                </td>
                                <td class="px-5 py-3 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button @click="ouvrirEdition(type)" class="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                            Modifier
                                        </button>
                                        <button v-if="type.demandes_count === 0" @click="confirmerSuppression(type)"
                                            class="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                                            Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="!typesAide.length">
                                <td colspan="6" class="px-5 py-12 text-center text-sm text-gray-400">
                                    Aucun type d'aide configuré.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal Créer / Modifier -->
        <Modal :show="showModal" :title="modeEdition ? 'Modifier le type d\'aide' : 'Nouveau type d\'aide'" @close="fermerModal">
            <form @submit.prevent="soumettre" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom <span class="text-red-500">*</span></label>
                    <input v-model="typeForm.nom" type="text" placeholder="Ex : Aide médicale"
                        class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                        :class="typeForm.errors.nom ? 'border-red-300' : 'border-gray-300'" />
                    <p v-if="typeForm.errors.nom" class="mt-1 text-xs text-red-600">{{ typeForm.errors.nom }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Code <span class="text-red-500">*</span></label>
                    <input v-model="typeForm.code" type="text" placeholder="Ex : AIDE_MED" maxlength="30"
                        class="w-full px-3 py-2.5 text-sm border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] uppercase"
                        :class="typeForm.errors.code ? 'border-red-300' : 'border-gray-300'"
                        @input="typeForm.code = typeForm.code.toUpperCase()" />
                    <p v-if="typeForm.errors.code" class="mt-1 text-xs text-red-600">{{ typeForm.errors.code }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea v-model="typeForm.description" rows="3" placeholder="Description optionnelle..."
                        class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] resize-none" />
                </div>
                <div class="flex items-center gap-2">
                    <input v-model="typeForm.actif" type="checkbox" id="actif" class="w-4 h-4 rounded text-[#1B3A2D]" />
                    <label for="actif" class="text-sm text-gray-700">Type d'aide actif</label>
                </div>
            </form>
            <template #footer>
                <button @click="fermerModal" type="button" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Annuler
                </button>
                <button @click="soumettre" :disabled="typeForm.processing"
                    class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-60">
                    {{ typeForm.processing ? 'Enregistrement...' : (modeEdition ? 'Mettre à jour' : 'Créer') }}
                </button>
            </template>
        </Modal>

        <!-- Modal Suppression -->
        <Modal :show="showDeleteModal" title="Supprimer le type d'aide" size="sm" @close="showDeleteModal = false">
            <p class="text-sm text-gray-600">Voulez-vous supprimer le type d'aide <strong>{{ typeASelectionner?.nom }}</strong> ? Cette action est irréversible.</p>
            <template #footer>
                <button @click="showDeleteModal = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="supprimerType" :disabled="deleteForm.processing"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60">
                    {{ deleteForm.processing ? 'Suppression...' : 'Supprimer' }}
                </button>
            </template>
        </Modal>
    </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useForm } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';
import Modal from '@/Components/UI/Modal.vue';

const props = defineProps({
    userData:  { type: Object, required: true },
    typesAide: { type: Array,  default: () => [] },
    isAdmin:   { type: Boolean, default: false },
});

// Onglets
const tabs = computed(() => {
    const t = [{ key: 'profil', label: 'Mon profil' }];
    if (props.isAdmin) t.push({ key: 'types-aide', label: "Types d'aide" });
    return t;
});
const activeTab = ref('profil');

// Profil
const initiales = computed(() =>
    (props.userData.name ?? 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
);
const roleLabel = computed(() => {
    const labels = { administrateur: 'Administrateur', agent: 'Agent', comite: 'Comité' };
    return labels[props.userData.role] ?? 'Utilisateur';
});

const profilForm = useForm({ name: props.userData.name ?? '', email: props.userData.email ?? '' });
const mdpForm    = useForm({ current_password: '', password: '', password_confirmation: '' });

function sauvegarderProfil() {
    profilForm.put(route('parametres.update-profil'));
}
function changerMotDePasse() {
    mdpForm.put(route('parametres.update-password'), { onSuccess: () => mdpForm.reset() });
}

// Types d'aide
const showModal      = ref(false);
const showDeleteModal = ref(false);
const modeEdition    = ref(false);
const typeASelectionner = ref(null);

const typeForm  = useForm({ nom: '', code: '', description: '', actif: true });
const deleteForm = useForm({});
const toggleForm = useForm({});

function ouvrirCreation() {
    modeEdition.value = false;
    typeForm.reset();
    typeForm.actif = true;
    showModal.value = true;
}

function ouvrirEdition(type) {
    modeEdition.value = true;
    typeASelectionner.value = type;
    typeForm.nom         = type.nom;
    typeForm.code        = type.code;
    typeForm.description = type.description ?? '';
    typeForm.actif       = type.actif;
    showModal.value = true;
}

function fermerModal() {
    showModal.value = false;
    typeForm.reset();
    typeForm.clearErrors();
}

function soumettre() {
    if (modeEdition.value) {
        typeForm.put(route('referentiels.types-aide.update', typeASelectionner.value.id), {
            onSuccess: () => fermerModal(),
        });
    } else {
        typeForm.post(route('referentiels.types-aide.store'), {
            onSuccess: () => fermerModal(),
        });
    }
}

function confirmerSuppression(type) {
    typeASelectionner.value = type;
    showDeleteModal.value = true;
}

function supprimerType() {
    deleteForm.delete(route('referentiels.types-aide.destroy', typeASelectionner.value.id), {
        onSuccess: () => { showDeleteModal.value = false; },
    });
}

function toggleActif(type) {
    toggleForm.patch(route('referentiels.types-aide.toggle', type.id));
}
</script>
