<template>
    <AppLayout title="Années de gestion">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Années de gestion</h1>
                <p class="text-sm text-gray-500 mt-0.5">Gérez les années calendaires et leur statut.</p>
            </div>
            <button @click="openCreate" class="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nouvelle année
            </button>
        </div>

        <!-- Flash -->
        <FlashMessage />

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                        <th class="text-left px-5 py-3 font-medium">Année</th>
                        <th class="text-left px-4 py-3 font-medium">Statut</th>
                        <th class="text-left px-4 py-3 font-medium">Date d'ouverture</th>
                        <th class="text-left px-4 py-3 font-medium">Date de clôture</th>
                        <th class="text-right px-4 py-3 font-medium">Demandes</th>
                        <th class="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="annee in annees" :key="annee.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td class="px-5 py-3 font-semibold text-gray-900">{{ annee.annee }}</td>
                        <td class="px-4 py-3">
                            <span :class="statutClass(annee.statut)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                {{ statutLabel(annee.statut) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-gray-600">{{ formatDate(annee.date_ouverture) }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ formatDate(annee.date_cloture) ?? '—' }}</td>
                        <td class="px-4 py-3 text-right font-medium text-gray-700">{{ annee.demandes_count }}</td>
                        <td class="px-5 py-3">
                            <div class="flex items-center justify-end gap-1.5">
                                <button v-if="annee.statut === 'ouvert'" @click="confirmerAction(annee, 'cloturer')"
                                    class="text-xs text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-2.5 py-1 rounded-lg transition-colors font-medium">
                                    Clôturer
                                </button>
                                <button v-if="annee.statut === 'cloture'" @click="confirmerAction(annee, 'archiver')"
                                    class="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors font-medium">
                                    Archiver
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!annees.length">
                        <td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">Aucune année de gestion créée.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Création -->
        <Modal :show="showModal" title="Nouvelle année de gestion" @close="showModal = false">
            <form @submit.prevent="submit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Année <span class="text-red-500">*</span></label>
                    <input v-model="form.annee" type="number" min="2020" max="2099" placeholder="ex: 2025"
                        class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                        :class="form.errors.annee ? 'border-red-300' : 'border-gray-300'" />
                    <p v-if="form.errors.annee" class="mt-1 text-xs text-red-600">{{ form.errors.annee }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Date d'ouverture</label>
                    <input v-model="form.date_ouverture" type="date"
                        class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                </div>
            </form>
            <template #footer>
                <button @click="showModal = false" type="button" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
                <button @click="submit" :disabled="form.processing" class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] transition-colors disabled:opacity-60">
                    {{ form.processing ? 'Création...' : 'Créer' }}
                </button>
            </template>
        </Modal>

        <!-- Modal Confirmation action -->
        <Modal :show="showConfirm" :title="confirmTitle" size="sm" @close="showConfirm = false">
            <p class="text-sm text-gray-600">{{ confirmMessage }}</p>
            <template #footer>
                <button @click="showConfirm = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="executeAction" :disabled="actionForm.processing"
                    :class="confirmAction === 'cloturer' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'"
                    class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60">
                    {{ actionForm.processing ? 'En cours...' : 'Confirmer' }}
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
    annees: { type: Array, default: () => [] },
});

const showModal   = ref(false);
const showConfirm = ref(false);
const confirmAction = ref('');
const confirmTitle  = ref('');
const confirmMessage = ref('');
const selectedAnnee = ref(null);

const form = useForm({ annee: new Date().getFullYear(), date_ouverture: '' });
const actionForm = useForm({});

function openCreate() {
    form.reset();
    form.annee = new Date().getFullYear();
    showModal.value = true;
}

function submit() {
    form.post(route('referentiels.annees.store'), {
        onSuccess: () => { showModal.value = false; form.reset(); },
    });
}

function confirmerAction(annee, action) {
    selectedAnnee.value = annee;
    confirmAction.value = action;
    if (action === 'cloturer') {
        confirmTitle.value   = 'Clôturer l\'année';
        confirmMessage.value = `Voulez-vous clôturer l'année de gestion ${annee.annee} ? Aucune nouvelle demande ne pourra être soumise.`;
    } else {
        confirmTitle.value   = 'Archiver l\'année';
        confirmMessage.value = `Voulez-vous archiver l'année de gestion ${annee.annee} ? Cette action est irréversible.`;
    }
    showConfirm.value = true;
}

function executeAction() {
    const routeName = confirmAction.value === 'cloturer'
        ? 'referentiels.annees.cloturer'
        : 'referentiels.annees.archiver';

    actionForm.post(route(routeName, selectedAnnee.value.id), {
        onSuccess: () => { showConfirm.value = false; },
    });
}

function statutLabel(statut) {
    return { ouvert: 'Ouverte', cloture: 'Clôturée', archive: 'Archivée' }[statut] ?? statut;
}

function statutClass(statut) {
    return {
        ouvert:  'bg-green-100 text-green-700',
        cloture: 'bg-yellow-100 text-yellow-700',
        archive: 'bg-gray-100 text-gray-500',
    }[statut] ?? 'bg-gray-100 text-gray-500';
}

function formatDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('fr-FR');
}
</script>
