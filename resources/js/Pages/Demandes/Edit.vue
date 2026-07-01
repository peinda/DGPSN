<template>
    <AppLayout :title="`Modifier — ${demande.reference ?? 'Brouillon'}`">
        <div class="max-w-2xl mx-auto">
            <div class="flex items-center gap-3 mb-6">
                <Link :href="route('demandes.show', demande.id)" class="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </Link>
                <div>
                    <h1 class="text-xl font-bold text-gray-900">Modifier la demande</h1>
                    <p class="text-sm text-gray-500">{{ demande.reference ?? 'Brouillon' }} — {{ demande.citoyen?.prenom }} {{ demande.citoyen?.nom }}</p>
                </div>
            </div>

            <FlashMessage />

            <!-- Type d'aide -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                <h2 class="text-sm font-semibold text-gray-800 mb-4">Type d'aide & événement</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Année de gestion <span class="text-red-500">*</span></label>
                        <select v-model="form.annee_gestion_id" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                            :class="form.errors.annee_gestion_id ? 'border-red-300' : 'border-gray-300'">
                            <option v-for="a in annees" :key="a.id" :value="a.id">{{ a.annee }}</option>
                        </select>
                        <p v-if="form.errors.annee_gestion_id" class="mt-1 text-xs text-red-600">{{ form.errors.annee_gestion_id }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Type d'aide <span class="text-red-500">*</span></label>
                        <select v-model="form.type_aide_id" @change="form.evenement_id = ''" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                            :class="form.errors.type_aide_id ? 'border-red-300' : 'border-gray-300'">
                            <option value="">Sélectionner...</option>
                            <option v-for="t in typesAide" :key="t.id" :value="t.id">{{ t.nom }}</option>
                        </select>
                        <p v-if="form.errors.type_aide_id" class="mt-1 text-xs text-red-600">{{ form.errors.type_aide_id }}</p>
                    </div>
                    <div v-if="evenementsFiltres.length">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Événement</label>
                        <select v-model="form.evenement_id" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                            <option value="">— Aucun —</option>
                            <option v-for="e in evenementsFiltres" :key="e.id" :value="e.id">{{ e.nom }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Prestataires -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
                <h2 class="text-sm font-semibold text-gray-800 mb-4">Prestataires & montants</h2>

                <div v-if="form.prestataires.length" class="space-y-2 mb-4">
                    <div v-for="(p, i) in form.prestataires" :key="p.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span class="flex-1 text-sm font-medium text-gray-800">{{ prestataireName(p.id) }}</span>
                        <input v-model.number="p.montant_estime" type="number" min="0" placeholder="Montant (FCFA)"
                            class="w-36 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                        <button type="button" @click="form.prestataires.splice(i, 1)" class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="text-right text-sm font-semibold text-gray-800 pt-1">
                        Total : {{ totalFormate }} FCFA
                    </div>
                </div>

                <div class="border border-dashed border-gray-300 rounded-lg p-4">
                    <p class="text-xs font-medium text-gray-500 mb-3">Ajouter un prestataire</p>
                    <div class="relative mb-2">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input v-model="searchPrestataire" type="text" placeholder="Rechercher..."
                            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                    </div>
                    <div class="max-h-36 overflow-y-auto space-y-1">
                        <button v-for="p in prestatairesDisponibles" :key="p.id" type="button" @click="ajouterPrestataire(p)"
                            class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-[#1B3A2D]/5 text-left transition-colors">
                            <span class="font-medium text-gray-800">{{ p.nom }}</span>
                            <span class="text-xs text-gray-400">{{ typeLabel(p.type) }}</span>
                        </button>
                        <p v-if="!prestatairesDisponibles.length" class="text-xs text-gray-400 text-center py-2">Aucun prestataire.</p>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
                <Link :href="route('demandes.show', demande.id)" class="px-5 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Annuler
                </Link>
                <button @click="sauvegarder" :disabled="form.processing"
                    class="px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-60">
                    {{ form.processing ? 'Enregistrement...' : 'Sauvegarder les modifications' }}
                </button>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link, useForm } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';

const props = defineProps({
    demande:      { type: Object, required: true },
    typesAide:    { type: Array,  default: () => [] },
    prestataires: { type: Array,  default: () => [] },
    annees:       { type: Array,  default: () => [] },
});

const searchPrestataire = ref('');

const form = useForm({
    type_aide_id:         props.demande.type_aide_id      ?? '',
    evenement_id:         props.demande.evenement_id      ?? '',
    annee_gestion_id:     props.demande.annee_gestion_id  ?? '',
    periode_ouverture_id: props.demande.periode_ouverture_id ?? '',
    prestataires: (props.demande.prestataires ?? []).map(p => ({
        id:             p.id,
        montant_estime: p.pivot?.montant_estime ?? 0,
    })),
});

const evenementsFiltres = computed(() =>
    props.typesAide.find(t => t.id == form.type_aide_id)?.evenements ?? []
);

const prestatairesDisponibles = computed(() => {
    const ids = form.prestataires.map(p => p.id);
    return props.prestataires.filter(p =>
        !ids.includes(p.id) &&
        (!searchPrestataire.value || p.nom.toLowerCase().includes(searchPrestataire.value.toLowerCase()))
    );
});

const totalFormate = computed(() =>
    new Intl.NumberFormat('fr-FR').format(form.prestataires.reduce((s, p) => s + (p.montant_estime || 0), 0))
);

function ajouterPrestataire(p) {
    form.prestataires.push({ id: p.id, montant_estime: 0 });
    searchPrestataire.value = '';
}

function prestataireName(id) { return props.prestataires.find(p => p.id === id)?.nom ?? ''; }
function typeLabel(t) { return { hopital: 'Hôpital', pharmacie: 'Pharmacie', clinique: 'Clinique', autre: 'Autre' }[t] ?? t; }

function sauvegarder() {
    form.put(route('demandes.update', props.demande.id));
}
</script>
