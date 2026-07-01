<template>
    <AppLayout title="Périodes d'ouverture">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Périodes d'ouverture</h1>
                <p class="text-sm text-gray-500 mt-0.5">Définissez les fenêtres de dépôt des demandes par événement.</p>
            </div>
            <button @click="openModal()" class="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Nouvelle période
            </button>
        </div>

        <FlashMessage />

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                        <th class="text-left px-5 py-3 font-medium">Événement</th>
                        <th class="text-left px-4 py-3 font-medium">Type d'aide</th>
                        <th class="text-left px-4 py-3 font-medium">Année</th>
                        <th class="text-left px-4 py-3 font-medium">Début</th>
                        <th class="text-left px-4 py-3 font-medium">Fin</th>
                        <th class="text-left px-4 py-3 font-medium">Statut</th>
                        <th class="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in periodes" :key="p.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td class="px-5 py-3 font-medium text-gray-900">{{ p.evenement?.nom }}</td>
                        <td class="px-4 py-3 text-gray-500 text-xs">{{ p.evenement?.type_aide?.nom }}</td>
                        <td class="px-4 py-3 font-semibold text-gray-700">{{ p.annee_gestion?.annee }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ formatDate(p.date_debut) }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ formatDate(p.date_fin) }}</td>
                        <td class="px-4 py-3">
                            <span :class="periodeStatutClass(p)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                                {{ periodeStatutLabel(p) }}
                            </span>
                        </td>
                        <td class="px-5 py-3">
                            <div class="flex justify-end gap-2">
                                <button @click="openModal(p)" class="text-xs text-blue-600 hover:underline font-medium">Modifier</button>
                                <button @click="confirmDel(p)" class="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!periodes.length">
                        <td colspan="7" class="px-5 py-10 text-center text-sm text-gray-400">Aucune période d'ouverture définie.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal Create/Edit -->
        <Modal :show="showModal" :title="editing ? 'Modifier la période' : 'Nouvelle période d\'ouverture'" size="lg" @close="showModal = false">
            <form @submit.prevent="submit" class="space-y-4">
                <div v-if="!editing" class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Événement <span class="text-red-500">*</span></label>
                        <select v-model="form.evenement_id" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" :class="form.errors.evenement_id ? 'border-red-300' : 'border-gray-300'">
                            <option value="">Sélectionner...</option>
                            <option v-for="ev in evenements" :key="ev.id" :value="ev.id">{{ ev.nom }} ({{ ev.type_aide?.nom }})</option>
                        </select>
                        <p v-if="form.errors.evenement_id" class="mt-1 text-xs text-red-600">{{ form.errors.evenement_id }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Année de gestion <span class="text-red-500">*</span></label>
                        <select v-model="form.annee_gestion_id" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" :class="form.errors.annee_gestion_id ? 'border-red-300' : 'border-gray-300'">
                            <option value="">Sélectionner...</option>
                            <option v-for="a in annees" :key="a.id" :value="a.id">{{ a.annee }} ({{ statutLabel(a.statut) }})</option>
                        </select>
                        <p v-if="form.errors.annee_gestion_id" class="mt-1 text-xs text-red-600">{{ form.errors.annee_gestion_id }}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Date de début <span class="text-red-500">*</span></label>
                        <input v-model="form.date_debut" type="date" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" :class="form.errors.date_debut ? 'border-red-300' : 'border-gray-300'" />
                        <p v-if="form.errors.date_debut" class="mt-1 text-xs text-red-600">{{ form.errors.date_debut }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Date de fin <span class="text-red-500">*</span></label>
                        <input v-model="form.date_fin" type="date" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" :class="form.errors.date_fin ? 'border-red-300' : 'border-gray-300'" />
                        <p v-if="form.errors.date_fin" class="mt-1 text-xs text-red-600">{{ form.errors.date_fin }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="form.actif" id="periode-actif" class="w-4 h-4 rounded border-gray-300 text-[#1B3A2D]" />
                    <label for="periode-actif" class="text-sm text-gray-700">Période active</label>
                </div>
            </form>
            <template #footer>
                <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="submit" :disabled="form.processing" class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                    {{ form.processing ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Créer') }}
                </button>
            </template>
        </Modal>

        <!-- Modal Suppression -->
        <Modal :show="showDelete" title="Supprimer la période" size="sm" @close="showDelete = false">
            <p class="text-sm text-gray-600">Voulez-vous supprimer la période <strong>{{ deletingPeriode?.evenement?.nom }} — {{ deletingPeriode?.annee_gestion?.annee }}</strong> ?</p>
            <template #footer>
                <button @click="showDelete = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="execDelete" :disabled="deleteForm.processing" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
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
    periodes:   { type: Array, default: () => [] },
    evenements: { type: Array, default: () => [] },
    annees:     { type: Array, default: () => [] },
});

const showModal = ref(false);
const editing   = ref(null);
const form = useForm({ evenement_id: '', annee_gestion_id: '', date_debut: '', date_fin: '', actif: true });

function openModal(p = null) {
    editing.value = p;
    if (p) {
        form.date_debut = p.date_debut?.slice(0, 10) ?? '';
        form.date_fin   = p.date_fin?.slice(0, 10) ?? '';
        form.actif      = p.actif;
    } else {
        form.reset(); form.actif = true;
    }
    showModal.value = true;
}

function submit() {
    const opts = { onSuccess: () => { showModal.value = false; form.reset(); } };
    if (editing.value) {
        form.put(route('referentiels.periodes.update', editing.value.id), opts);
    } else {
        form.post(route('referentiels.periodes.store'), opts);
    }
}

const showDelete     = ref(false);
const deletingPeriode = ref(null);
const deleteForm     = useForm({});

function confirmDel(p) { deletingPeriode.value = p; showDelete.value = true; }
function execDelete() {
    deleteForm.delete(route('referentiels.periodes.destroy', deletingPeriode.value.id), {
        onSuccess: () => { showDelete.value = false; },
    });
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : '—'; }
function statutLabel(s) { return { ouvert: 'Ouverte', cloture: 'Clôturée', archive: 'Archivée' }[s] ?? s; }

function periodeStatutLabel(p) {
    if (!p.actif) return 'Inactive';
    const now = new Date(), d = new Date(p.date_debut), f = new Date(p.date_fin);
    if (now < d) return 'À venir';
    if (now > f) return 'Expirée';
    return 'Active';
}

function periodeStatutClass(p) {
    const label = periodeStatutLabel(p);
    return {
        'Active':   'bg-green-100 text-green-700',
        'À venir':  'bg-blue-100 text-blue-700',
        'Expirée':  'bg-gray-100 text-gray-500',
        'Inactive': 'bg-gray-100 text-gray-400',
    }[label] ?? 'bg-gray-100 text-gray-500';
}
</script>
