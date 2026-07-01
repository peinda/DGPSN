<template>
    <AppLayout title="Demandes sociales">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Demandes sociales</h1>
                <p class="text-sm text-gray-500 mt-0.5">Suivi de toutes les demandes de prise en charge.</p>
            </div>
            <Link v-if="can('demandes.creer')" :href="route('demandes.create')"
                class="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Nouvelle demande
            </Link>
        </div>

        <FlashMessage />

        <!-- Filtres -->
        <div class="flex flex-wrap gap-3 mb-5">
            <div class="relative flex-1 min-w-48">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="localFilters.search" type="text" placeholder="Référence, citoyen, CIN..."
                    class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                    @keyup.enter="applyFilters" />
            </div>
            <select v-model="localFilters.statut" @change="applyFilters" class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                <option value="">Tous les statuts</option>
                <option v-for="s in statuts" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
            <select v-model="localFilters.type_aide_id" @change="applyFilters" class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                <option value="">Tous les types</option>
                <option v-for="t in typesAide" :key="t.id" :value="t.id">{{ t.nom }}</option>
            </select>
            <select v-model="localFilters.annee_gestion_id" @change="applyFilters" class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                <option value="">Toutes les années</option>
                <option v-for="a in annees" :key="a.id" :value="a.id">{{ a.annee }}</option>
            </select>
            <button @click="applyFilters"
                class="px-4 py-2 text-sm font-medium bg-[#1B3A2D] text-white rounded-lg hover:bg-[#254d3c] transition-colors">
                Filtrer
            </button>
            <button v-if="hasActiveFilters()" @click="resetFilters"
                class="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                Réinitialiser
            </button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                        <th class="text-left px-5 py-3 font-medium">Référence</th>
                        <th class="text-left px-4 py-3 font-medium">Citoyen</th>
                        <th class="text-left px-4 py-3 font-medium">Type d'aide</th>
                        <th class="text-left px-4 py-3 font-medium">Événement</th>
                        <th class="text-left px-4 py-3 font-medium">Statut</th>
                        <th class="text-left px-4 py-3 font-medium">Date</th>
                        <th class="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="d in demandes.data" :key="d.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td class="px-5 py-3 font-mono text-xs text-gray-700">{{ d.reference ?? '—' }}</td>
                        <td class="px-4 py-3">
                            <p class="font-medium text-gray-900 text-xs">{{ d.citoyen?.prenom }} {{ d.citoyen?.nom }}</p>
                            <p class="text-gray-400 text-xs">{{ d.citoyen?.cin }}</p>
                        </td>
                        <td class="px-4 py-3 text-gray-700">{{ d.type_aide?.nom }}</td>
                        <td class="px-4 py-3 text-gray-500 text-xs">{{ d.evenement?.nom ?? '—' }}</td>
                        <td class="px-4 py-3"><StatusBadge :status="d.statut" /></td>
                        <td class="px-4 py-3 text-gray-500 text-xs">{{ formatDate(d.created_at) }}</td>
                        <td class="px-5 py-3 text-right">
                            <Link :href="route('demandes.show', d.id)" class="text-xs text-blue-600 hover:underline font-medium">Détail</Link>
                        </td>
                    </tr>
                    <tr v-if="!demandes.data?.length">
                        <td colspan="7" class="px-5 py-12 text-center text-sm text-gray-400">Aucune demande trouvée.</td>
                    </tr>
                </tbody>
            </table>

            <div v-if="demandes.last_page > 1" class="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p class="text-xs text-gray-500">{{ demandes.total }} demande(s)</p>
                <div class="flex gap-1">
                    <Link v-for="link in demandes.links" :key="link.label" :href="link.url ?? ''" v-html="link.label"
                        :class="[link.active ? 'bg-[#1B3A2D] text-white' : 'text-gray-600 hover:bg-gray-100', !link.url ? 'opacity-40 pointer-events-none' : '']"
                        class="px-3 py-1.5 text-xs rounded-lg transition-colors" preserve-scroll />
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { reactive } from 'vue';
import { Link, router, usePage } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';
import StatusBadge from '@/Components/UI/StatusBadge.vue';

const props = defineProps({
    demandes:  { type: Object, default: () => ({ data: [], total: 0, last_page: 1, links: [] }) },
    typesAide: { type: Array,  default: () => [] },
    annees:    { type: Array,  default: () => [] },
    statuts:   { type: Array,  default: () => [] },
    filters:   { type: Object, default: () => ({}) },
});

const page = usePage();
const permissions = page.props.auth?.user?.permissions ?? [];
function can(p) { return permissions.includes(p); }

const localFilters = reactive({
    search:           props.filters.search           ?? '',
    statut:           props.filters.statut           ?? '',
    type_aide_id:     props.filters.type_aide_id     ?? '',
    annee_gestion_id: props.filters.annee_gestion_id ?? '',
});

function applyFilters() {
    router.get(route('demandes.index'), {
        search:           localFilters.search           || undefined,
        statut:           localFilters.statut           || undefined,
        type_aide_id:     localFilters.type_aide_id     || undefined,
        annee_gestion_id: localFilters.annee_gestion_id || undefined,
    }, { preserveState: true, replace: true });
}

function resetFilters() {
    localFilters.search = '';
    localFilters.statut = '';
    localFilters.type_aide_id = '';
    localFilters.annee_gestion_id = '';
    router.get(route('demandes.index'), {}, { preserveState: true, replace: true });
}

const hasActiveFilters = () =>
    !!(localFilters.search || localFilters.statut || localFilters.type_aide_id || localFilters.annee_gestion_id);

function formatDate(d) {
    return d ? new Date(d).toLocaleDateString('fr-FR') : '—';
}
</script>
