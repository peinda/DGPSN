<template>
    <AppLayout title="Rapports & Statistiques">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Rapports & Statistiques</h1>
                <p class="text-sm text-gray-500 mt-0.5">Vue d'ensemble en temps réel des demandes de prise en charge.</p>
            </div>
            <Link :href="route('rapports.exports')" class="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Exports
            </Link>
        </div>

        <!-- Filtres -->
        <div class="flex gap-3 mb-6">
            <select v-model="localFilters.annee_gestion_id" @change="applyFilters"
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 bg-white">
                <option value="">Toutes les années</option>
                <option v-for="a in annees" :key="a.id" :value="a.id">{{ a.annee }}</option>
            </select>
            <select v-model="localFilters.type_aide_id" @change="applyFilters"
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 bg-white">
                <option value="">Tous les types</option>
                <option v-for="t in typesAide" :key="t.id" :value="t.id">{{ t.nom }}</option>
            </select>
            <div class="flex items-center px-3 py-2 bg-[#1B3A2D]/5 rounded-lg">
                <span class="text-sm font-semibold text-[#1B3A2D]">{{ totalGeneral.toLocaleString('fr-FR') }} demande(s)</span>
            </div>
        </div>

        <!-- KPI par statut -->
        <div class="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div v-for="s in parStatut" :key="s.statut"
                class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
                <p class="text-xs text-gray-500 mb-1">{{ s.label }}</p>
                <p class="text-2xl font-bold text-gray-900">{{ s.count.toLocaleString('fr-FR') }}</p>
                <div class="mt-2 h-1 rounded-full" :style="{ backgroundColor: couleurStatut(s.couleur) }" />
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

            <!-- Évolution 12 mois -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 class="text-sm font-semibold text-gray-800 mb-4">Évolution des demandes (12 mois)</h2>
                <div class="overflow-x-auto">
                    <div class="flex items-end gap-1.5 h-40 min-w-full">
                        <div v-for="m in evolution" :key="m.label" class="flex flex-col items-center gap-1 flex-1 min-w-0">
                            <span class="text-xs text-gray-500 font-medium">{{ m.total || '' }}</span>
                            <div class="w-full flex flex-col justify-end" style="height: 100px;">
                                <div class="w-full rounded-t-sm bg-[#1B3A2D]/20 relative overflow-hidden"
                                    :style="{ height: barHeight(m.total) }">
                                    <div class="absolute bottom-0 left-0 right-0 bg-[#1B3A2D] rounded-t-sm"
                                        :style="{ height: barHeight(m.approuvees) }" />
                                </div>
                            </div>
                            <span class="text-[10px] text-gray-400 truncate w-full text-center">{{ m.label }}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 mt-3">
                        <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-[#1B3A2D]" /><span class="text-xs text-gray-500">Approuvées</span></div>
                        <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-[#1B3A2D]/20" /><span class="text-xs text-gray-500">Total</span></div>
                    </div>
                </div>
            </div>

            <!-- Par type d'aide -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 class="text-sm font-semibold text-gray-800 mb-4">Répartition par type d'aide</h2>
                <div class="space-y-3">
                    <div v-for="t in parType" :key="t.nom" class="space-y-1">
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-medium text-gray-700 truncate">{{ t.nom }}</span>
                            <span class="text-gray-500 ml-2 shrink-0">{{ t.total }} ({{ t.approuvees }} app.)</span>
                        </div>
                        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-[#1B3A2D] rounded-full transition-all"
                                :style="{ width: pct(t.total) + '%' }" />
                        </div>
                    </div>
                    <p v-if="!parType.length" class="text-sm text-gray-400 py-4 text-center">Aucune donnée.</p>
                </div>
            </div>
        </div>

        <!-- Par région -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100">
                <h2 class="text-sm font-semibold text-gray-800">Répartition par région</h2>
            </div>
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                        <th class="text-left px-5 py-3 font-medium">Région</th>
                        <th class="text-right px-5 py-3 font-medium">Demandes</th>
                        <th class="text-left px-5 py-3 font-medium w-48">Proportion</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in parRegion" :key="r.nom" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td class="px-5 py-3 font-medium text-gray-800">{{ r.nom }}</td>
                        <td class="px-5 py-3 text-right font-semibold text-gray-700">{{ r.total.toLocaleString('fr-FR') }}</td>
                        <td class="px-5 py-3">
                            <div class="h-2 bg-gray-100 rounded-full overflow-hidden w-40">
                                <div class="h-full bg-[#1B3A2D]/70 rounded-full" :style="{ width: pct(r.total) + '%' }" />
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!parRegion.length">
                        <td colspan="3" class="px-5 py-8 text-center text-sm text-gray-400">Aucune donnée disponible.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AppLayout>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({
    parStatut:    { type: Array,  default: () => [] },
    parType:      { type: Array,  default: () => [] },
    parRegion:    { type: Array,  default: () => [] },
    evolution:    { type: Array,  default: () => [] },
    annees:       { type: Array,  default: () => [] },
    typesAide:    { type: Array,  default: () => [] },
    totalGeneral: { type: Number, default: 0 },
    filters:      { type: Object, default: () => ({}) },
});

const localFilters = reactive({
    annee_gestion_id: props.filters.annee_gestion_id ?? '',
    type_aide_id:     props.filters.type_aide_id     ?? '',
});

function applyFilters() {
    router.get(route('rapports.index'), {
        annee_gestion_id: localFilters.annee_gestion_id || undefined,
        type_aide_id:     localFilters.type_aide_id     || undefined,
    }, { preserveState: true, replace: true });
}

const maxTotal = computed(() => Math.max(...props.evolution.map(m => m.total), 1));
const maxType  = computed(() => Math.max(...props.parType.map(t => t.total), 1));

function barHeight(val) {
    return Math.max((val / maxTotal.value) * 100, val > 0 ? 4 : 0) + 'px';
}

function pct(val) {
    return Math.round((val / maxType.value) * 100);
}

function couleurStatut(couleur) {
    const map = { green: '#16a34a', blue: '#3b82f6', purple: '#9333ea', red: '#ef4444', gray: '#9ca3af', slate: '#64748b' };
    return map[couleur] ?? '#9ca3af';
}
</script>
