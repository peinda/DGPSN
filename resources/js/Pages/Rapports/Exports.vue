<template>
    <AppLayout title="Exports">
        <div class="max-w-2xl mx-auto">
            <div class="mb-6">
                <h1 class="text-xl font-bold text-gray-900">Exports</h1>
                <p class="text-sm text-gray-500 mt-0.5">Générez et téléchargez les rapports au format CSV.</p>
            </div>

            <FlashMessage />

            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                <h2 class="text-sm font-semibold text-gray-800">Export des demandes</h2>

                <!-- Filtres -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Année de gestion</label>
                        <select v-model="filters.annee_gestion_id"
                            class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                            <option value="">Toutes les années</option>
                            <option v-for="a in annees" :key="a.id" :value="a.id">{{ a.annee }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Type d'aide</label>
                        <select v-model="filters.type_aide_id"
                            class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                            <option value="">Tous les types</option>
                            <option v-for="t in typesAide" :key="t.id" :value="t.id">{{ t.nom }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
                        <select v-model="filters.statut"
                            class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                            <option value="">Tous les statuts</option>
                            <option value="brouillon">Brouillon</option>
                            <option value="soumis">Soumis</option>
                            <option value="en_examen">En examen</option>
                            <option value="approuve">Approuvé</option>
                            <option value="rejete">Rejeté</option>
                            <option value="cloture">Clôturé</option>
                        </select>
                    </div>
                </div>

                <!-- Format info -->
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div>
                            <p class="text-sm font-medium text-blue-800">Format CSV (compatible Excel)</p>
                            <p class="text-xs text-blue-600 mt-0.5">Le fichier inclut : Référence, Date, CIN, Nom, Prénom, Téléphone, Localité, Type d'aide, Événement, Statut, Montant total, Agent.</p>
                        </div>
                    </div>
                </div>

                <!-- Boutons export -->
                <div class="grid grid-cols-2 gap-3">
                    <a :href="exportUrlExcel" target="_blank"
                        class="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10m0-10a2 2 0 012 2v8a2 2 0 01-2 2h-2"/>
                        </svg>
                        Excel (.xlsx)
                    </a>
                    <a :href="exportUrlCsv" target="_blank"
                        class="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#1B3A2D] bg-white border border-[#1B3A2D] hover:bg-[#1B3A2D]/5 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        CSV (.csv)
                    </a>
                </div>
            </div>

            <!-- Lien retour -->
            <div class="mt-4 text-center">
                <Link :href="route('rapports.index')" class="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                    ← Retour au tableau de bord des rapports
                </Link>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';

const props = defineProps({
    annees:    { type: Array, default: () => [] },
    typesAide: { type: Array, default: () => [] },
});

const filters = reactive({ annee_gestion_id: '', type_aide_id: '', statut: '' });

function buildUrl(routeName) {
    const params = new URLSearchParams();
    if (filters.annee_gestion_id) params.set('annee_gestion_id', filters.annee_gestion_id);
    if (filters.type_aide_id)     params.set('type_aide_id',     filters.type_aide_id);
    if (filters.statut)           params.set('statut',           filters.statut);
    const qs = params.toString();
    return route(routeName) + (qs ? '?' + qs : '');
}

const exportUrlExcel = computed(() => buildUrl('rapports.export-excel'));
const exportUrlCsv   = computed(() => buildUrl('rapports.export-csv'));
</script>
