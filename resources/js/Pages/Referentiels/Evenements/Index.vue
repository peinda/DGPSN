<template>
    <AppLayout title="Événements & Types d'aide">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Événements & Types d'aide</h1>
                <p class="text-sm text-gray-500 mt-0.5">Gérez les catégories et événements déclencheurs des demandes.</p>
            </div>
        </div>

        <FlashMessage />

        <!-- Tabs -->
        <div class="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                :class="activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-all">
                {{ tab.label }}
            </button>
        </div>

        <!-- Types d'aide -->
        <div v-show="activeTab === 'types'">
            <div class="flex justify-end mb-4">
                <button @click="openTypeModal()" class="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Nouveau type
                </button>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th class="text-left px-5 py-3 font-medium">Nom</th>
                            <th class="text-left px-4 py-3 font-medium">Code</th>
                            <th class="text-left px-4 py-3 font-medium">Description</th>
                            <th class="text-left px-4 py-3 font-medium">Statut</th>
                            <th class="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="type in typesAide" :key="type.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td class="px-5 py-3 font-medium text-gray-900">{{ type.nom }}</td>
                            <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ type.code }}</td>
                            <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{{ type.description ?? '—' }}</td>
                            <td class="px-4 py-3">
                                <span :class="type.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                                    {{ type.actif ? 'Actif' : 'Inactif' }}
                                </span>
                            </td>
                            <td class="px-5 py-3">
                                <div class="flex justify-end gap-2">
                                    <button @click="openTypeModal(type)" class="text-xs text-blue-600 hover:underline font-medium">Modifier</button>
                                    <button @click="confirmDelete('type', type)" class="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="!typesAide.length">
                            <td colspan="5" class="px-5 py-10 text-center text-sm text-gray-400">Aucun type d'aide créé.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Événements -->
        <div v-show="activeTab === 'evenements'">
            <div class="flex justify-end mb-4">
                <button @click="openEvenementModal()" class="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Nouvel événement
                </button>
            </div>
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th class="text-left px-5 py-3 font-medium">Nom</th>
                            <th class="text-left px-4 py-3 font-medium">Type d'aide</th>
                            <th class="text-left px-4 py-3 font-medium">Code</th>
                            <th class="text-left px-4 py-3 font-medium">Statut</th>
                            <th class="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ev in evenements" :key="ev.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td class="px-5 py-3 font-medium text-gray-900">{{ ev.nom }}</td>
                            <td class="px-4 py-3 text-gray-600">{{ ev.type_aide?.nom }}</td>
                            <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ ev.code }}</td>
                            <td class="px-4 py-3">
                                <span :class="ev.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                                    {{ ev.actif ? 'Actif' : 'Inactif' }}
                                </span>
                            </td>
                            <td class="px-5 py-3">
                                <div class="flex justify-end gap-2">
                                    <button @click="openEvenementModal(ev)" class="text-xs text-blue-600 hover:underline font-medium">Modifier</button>
                                    <button @click="confirmDelete('evenement', ev)" class="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="!evenements.length">
                            <td colspan="5" class="px-5 py-10 text-center text-sm text-gray-400">Aucun événement créé.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal Type d'aide -->
        <Modal :show="showTypeModal" :title="editingType ? 'Modifier le type d\'aide' : 'Nouveau type d\'aide'" @close="showTypeModal = false">
            <form @submit.prevent="submitType" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom <span class="text-red-500">*</span></label>
                    <input v-model="typeForm.nom" type="text" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" :class="typeForm.errors.nom ? 'border-red-300' : 'border-gray-300'" />
                    <p v-if="typeForm.errors.nom" class="mt-1 text-xs text-red-600">{{ typeForm.errors.nom }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Code <span class="text-red-500">*</span></label>
                    <input v-model="typeForm.code" type="text" placeholder="ex: ASSIST_MED" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] font-mono uppercase" :class="typeForm.errors.code ? 'border-red-300' : 'border-gray-300'" />
                    <p v-if="typeForm.errors.code" class="mt-1 text-xs text-red-600">{{ typeForm.errors.code }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea v-model="typeForm.description" rows="3" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] resize-none" />
                </div>
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="typeForm.actif" id="type-actif" class="w-4 h-4 rounded border-gray-300 text-[#1B3A2D]" />
                    <label for="type-actif" class="text-sm text-gray-700">Actif</label>
                </div>
            </form>
            <template #footer>
                <button @click="showTypeModal = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="submitType" :disabled="typeForm.processing" class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                    {{ typeForm.processing ? 'Enregistrement...' : (editingType ? 'Mettre à jour' : 'Créer') }}
                </button>
            </template>
        </Modal>

        <!-- Modal Événement -->
        <Modal :show="showEvenementModal" :title="editingEvenement ? 'Modifier l\'événement' : 'Nouvel événement'" @close="showEvenementModal = false">
            <form @submit.prevent="submitEvenement" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Type d'aide <span class="text-red-500">*</span></label>
                    <select v-model="evForm.type_aide_id" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" :class="evForm.errors.type_aide_id ? 'border-red-300' : 'border-gray-300'">
                        <option value="">Sélectionner un type...</option>
                        <option v-for="t in typesAide" :key="t.id" :value="t.id">{{ t.nom }}</option>
                    </select>
                    <p v-if="evForm.errors.type_aide_id" class="mt-1 text-xs text-red-600">{{ evForm.errors.type_aide_id }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom <span class="text-red-500">*</span></label>
                    <input v-model="evForm.nom" type="text" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" :class="evForm.errors.nom ? 'border-red-300' : 'border-gray-300'" />
                    <p v-if="evForm.errors.nom" class="mt-1 text-xs text-red-600">{{ evForm.errors.nom }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Code <span class="text-red-500">*</span></label>
                    <input v-model="evForm.code" type="text" placeholder="ex: TABASKI_2025" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] font-mono uppercase" :class="evForm.errors.code ? 'border-red-300' : 'border-gray-300'" />
                    <p v-if="evForm.errors.code" class="mt-1 text-xs text-red-600">{{ evForm.errors.code }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea v-model="evForm.description" rows="2" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] resize-none" />
                </div>
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="evForm.actif" id="ev-actif" class="w-4 h-4 rounded border-gray-300 text-[#1B3A2D]" />
                    <label for="ev-actif" class="text-sm text-gray-700">Actif</label>
                </div>
            </form>
            <template #footer>
                <button @click="showEvenementModal = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="submitEvenement" :disabled="evForm.processing" class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                    {{ evForm.processing ? 'Enregistrement...' : (editingEvenement ? 'Mettre à jour' : 'Créer') }}
                </button>
            </template>
        </Modal>

        <!-- Modal Suppression -->
        <Modal :show="showDeleteModal" title="Confirmer la suppression" size="sm" @close="showDeleteModal = false">
            <p class="text-sm text-gray-600">Cette action est irréversible. Voulez-vous supprimer <strong>{{ deletingItem?.nom }}</strong> ?</p>
            <template #footer>
                <button @click="showDeleteModal = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="executeDelete" :disabled="deleteForm.processing" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
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
import Modal from '@/Components/UI/Modal.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';

const props = defineProps({
    typesAide:  { type: Array, default: () => [] },
    evenements: { type: Array, default: () => [] },
});

const activeTab = ref('types');
const tabs = [
    { key: 'types', label: "Types d'aide" },
    { key: 'evenements', label: 'Événements' },
];

// --- Types d'aide ---
const showTypeModal = ref(false);
const editingType   = ref(null);
const typeForm = useForm({ nom: '', code: '', description: '', actif: true });

function openTypeModal(type = null) {
    editingType.value = type;
    if (type) {
        typeForm.nom = type.nom; typeForm.code = type.code;
        typeForm.description = type.description ?? ''; typeForm.actif = type.actif;
    } else {
        typeForm.reset(); typeForm.actif = true;
    }
    showTypeModal.value = true;
}

function submitType() {
    const opts = { onSuccess: () => { showTypeModal.value = false; typeForm.reset(); } };
    if (editingType.value) {
        typeForm.put(route('referentiels.types-aide.update', editingType.value.id), opts);
    } else {
        typeForm.post(route('referentiels.types-aide.store'), opts);
    }
}

// --- Événements ---
const showEvenementModal = ref(false);
const editingEvenement   = ref(null);
const evForm = useForm({ type_aide_id: '', nom: '', code: '', description: '', actif: true });

function openEvenementModal(ev = null) {
    editingEvenement.value = ev;
    if (ev) {
        evForm.type_aide_id = ev.type_aide_id; evForm.nom = ev.nom;
        evForm.code = ev.code; evForm.description = ev.description ?? ''; evForm.actif = ev.actif;
    } else {
        evForm.reset(); evForm.actif = true;
    }
    showEvenementModal.value = true;
}

function submitEvenement() {
    const opts = { onSuccess: () => { showEvenementModal.value = false; evForm.reset(); } };
    if (editingEvenement.value) {
        evForm.put(route('referentiels.evenements.update', editingEvenement.value.id), opts);
    } else {
        evForm.post(route('referentiels.evenements.store'), opts);
    }
}

// --- Suppression ---
const showDeleteModal = ref(false);
const deletingItem    = ref(null);
const deletingKind    = ref('');
const deleteForm      = useForm({});

function confirmDelete(kind, item) {
    deletingKind.value = kind; deletingItem.value = item; showDeleteModal.value = true;
}

function executeDelete() {
    const r = deletingKind.value === 'type'
        ? route('referentiels.types-aide.destroy', deletingItem.value.id)
        : route('referentiels.evenements.destroy', deletingItem.value.id);
    deleteForm.delete(r, { onSuccess: () => { showDeleteModal.value = false; } });
}
</script>
