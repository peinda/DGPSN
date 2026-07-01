<template>
    <AppLayout title="Comité de délibération">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Comité de délibération</h1>
                <p class="text-sm text-gray-500 mt-0.5">File d'attente des demandes à examiner.</p>
            </div>
            <div class="flex items-center gap-3">
                <span class="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <span class="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
                    {{ enAttente.length }} en attente
                </span>
            </div>
        </div>

        <FlashMessage />

        <!-- Tabs -->
        <div class="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                :class="activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2">
                {{ tab.label }}
                <span v-if="tab.key === 'attente'" class="px-1.5 py-0.5 text-xs rounded-full"
                    :class="activeTab === 'attente' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-500'">
                    {{ enAttente.length }}
                </span>
            </button>
        </div>

        <!-- File d'attente -->
        <div v-show="activeTab === 'attente'">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th class="text-left px-5 py-3 font-medium">Référence</th>
                            <th class="text-left px-4 py-3 font-medium">Citoyen</th>
                            <th class="text-left px-4 py-3 font-medium">Type d'aide</th>
                            <th class="text-left px-4 py-3 font-medium">Agent</th>
                            <th class="text-left px-4 py-3 font-medium">Soumise le</th>
                            <th class="text-left px-4 py-3 font-medium">Statut</th>
                            <th class="text-right px-5 py-3 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="d in enAttente" :key="d.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td class="px-5 py-3 font-mono text-xs text-gray-700 font-medium">{{ d.reference }}</td>
                            <td class="px-4 py-3">
                                <p class="font-medium text-gray-900">{{ d.citoyen?.prenom }} {{ d.citoyen?.nom }}</p>
                                <p class="text-xs text-gray-400">{{ d.citoyen?.cin }}</p>
                            </td>
                            <td class="px-4 py-3 text-gray-700">{{ d.type_aide?.nom }}</td>
                            <td class="px-4 py-3 text-gray-500 text-xs">{{ d.agent?.name }}</td>
                            <td class="px-4 py-3 text-gray-500 text-xs">{{ formatDate(d.date_soumission) }}</td>
                            <td class="px-4 py-3">
                                <span :class="d.statut === 'en_examen' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                                    {{ d.statut === 'en_examen' ? 'En examen' : 'Soumis' }}
                                </span>
                            </td>
                            <td class="px-5 py-3 text-right">
                                <Link :href="route('comite.show', d.id)"
                                    class="inline-flex items-center gap-1 text-xs font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] px-3 py-1.5 rounded-lg transition-colors">
                                    Examiner
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                                </Link>
                            </td>
                        </tr>
                        <tr v-if="!enAttente.length">
                            <td colspan="7" class="px-5 py-14 text-center">
                                <div class="flex flex-col items-center gap-3 text-gray-400">
                                    <svg class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                    </svg>
                                    <p class="text-sm">Aucune demande en attente de délibération.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Déjà traitées -->
        <div v-show="activeTab === 'traitees'">
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                            <th class="text-left px-5 py-3 font-medium">Référence</th>
                            <th class="text-left px-4 py-3 font-medium">Citoyen</th>
                            <th class="text-left px-4 py-3 font-medium">Type d'aide</th>
                            <th class="text-left px-4 py-3 font-medium">Délibérée par</th>
                            <th class="text-left px-4 py-3 font-medium">Date</th>
                            <th class="text-left px-4 py-3 font-medium">Décision</th>
                            <th class="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="d in traitees" :key="d.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td class="px-5 py-3 font-mono text-xs text-gray-700">{{ d.reference }}</td>
                            <td class="px-4 py-3 font-medium text-gray-900">{{ d.citoyen?.prenom }} {{ d.citoyen?.nom }}</td>
                            <td class="px-4 py-3 text-gray-600">{{ d.type_aide?.nom }}</td>
                            <td class="px-4 py-3 text-gray-500 text-xs">{{ d.comite_user?.name ?? '—' }}</td>
                            <td class="px-4 py-3 text-gray-500 text-xs">{{ formatDate(d.date_deliberation) }}</td>
                            <td class="px-4 py-3">
                                <span :class="d.statut === 'approuve' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                                    {{ d.statut === 'approuve' ? 'Approuvée' : 'Rejetée' }}
                                </span>
                            </td>
                            <td class="px-5 py-3 text-right flex items-center justify-end gap-2">
                                <Link :href="route('comite.show', d.id)" class="text-xs text-blue-600 hover:underline font-medium">Détail</Link>
                                <a v-if="d.statut === 'approuve'" :href="route('comite.bon-pdf', d.id)" target="_blank"
                                    class="text-xs text-[#1B3A2D] hover:underline font-medium flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    PDF
                                </a>
                            </td>
                        </tr>
                        <tr v-if="!traitees.length">
                            <td colspan="7" class="px-5 py-10 text-center text-sm text-gray-400">Aucune demande traitée.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';

defineProps({
    enAttente: { type: Array, default: () => [] },
    traitees:  { type: Array, default: () => [] },
});

const activeTab = ref('attente');
const tabs = [
    { key: 'attente',  label: 'En attente' },
    { key: 'traitees', label: 'Traitées' },
];

function formatDate(d) {
    return d ? new Date(d).toLocaleDateString('fr-FR') : '—';
}
</script>
