<template>
    <AppLayout title="Types d'aide">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Types d'aide</h1>
                <p class="text-sm text-gray-500 mt-0.5">Catégories d'aide sociale gérées par la DGPSN.</p>
            </div>
            <button @click="ouvrirCreation"
                class="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Nouveau type
            </button>
        </div>

        <FlashMessage />

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                        <td class="px-4 py-3">
                            <span class="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{{ type.code }}</span>
                        </td>
                        <td class="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{{ type.description ?? '—' }}</td>
                        <td class="px-4 py-3 text-center font-semibold text-gray-700">{{ type.demandes_count }}</td>
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
                                <button @click="ouvrirEdition(type)" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Modifier</button>
                                <button v-if="type.demandes_count === 0" @click="confirmerSuppression(type)"
                                    class="text-xs text-red-500 hover:text-red-700 font-medium">Supprimer</button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!typesAide.length">
                        <td colspan="6" class="px-5 py-12 text-center text-sm text-gray-400">Aucun type d'aide configuré.</td>
                    </tr>
                </tbody>
            </table>
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
                        class="w-full px-3 py-2.5 text-sm border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
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
                    <input v-model="typeForm.actif" type="checkbox" id="actif-ref" class="w-4 h-4 rounded text-[#1B3A2D]" />
                    <label for="actif-ref" class="text-sm text-gray-700">Type d'aide actif</label>
                </div>
            </form>
            <template #footer>
                <button @click="fermerModal" type="button" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
                <button @click="soumettre" :disabled="typeForm.processing"
                    class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-60">
                    {{ typeForm.processing ? 'Enregistrement...' : (modeEdition ? 'Mettre à jour' : 'Créer') }}
                </button>
            </template>
        </Modal>

        <!-- Modal Suppression -->
        <Modal :show="showDeleteModal" title="Supprimer le type d'aide" size="sm" @close="showDeleteModal = false">
            <p class="text-sm text-gray-600">Voulez-vous supprimer <strong>{{ typeASelectionner?.nom }}</strong> ? Cette action est irréversible.</p>
            <template #footer>
                <button @click="showDeleteModal = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="supprimerType" :disabled="deleteForm.processing"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60">
                    {{ deleteForm.processing ? 'Suppression...' : 'Supprimer' }}
                </button>
            </template>
        </Modal>
    </AppLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';
import Modal from '@/Components/UI/Modal.vue';

defineProps({ typesAide: { type: Array, default: () => [] } });

const showModal       = ref(false);
const showDeleteModal = ref(false);
const modeEdition     = ref(false);
const typeASelectionner = ref(null);

const typeForm   = useForm({ nom: '', code: '', description: '', actif: true });
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
