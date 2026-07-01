<template>
    <AppLayout title="Citoyens">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Citoyens bénéficiaires</h1>
                <p class="text-sm text-gray-500 mt-0.5">Base des citoyens enregistrés dans le système.</p>
            </div>
            <Link :href="route('demandes.create')" class="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Nouvelle demande
            </Link>
        </div>

        <FlashMessage />

        <!-- Recherche -->
        <div class="mb-5 flex gap-3">
            <div class="relative flex-1 max-w-sm">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="search" type="text" placeholder="Nom, prénom ou CIN..." @keyup.enter="applySearch"
                    class="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                <button v-if="search" @click="search = ''; applySearch()"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <button @click="applySearch" class="px-4 py-2 text-sm font-medium bg-[#1B3A2D] text-white hover:bg-[#254d3c] rounded-lg transition-colors">Rechercher</button>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                        <th class="text-left px-5 py-3 font-medium">CIN</th>
                        <th class="text-left px-4 py-3 font-medium">Nom complet</th>
                        <th class="text-left px-4 py-3 font-medium">Téléphone</th>
                        <th class="text-left px-4 py-3 font-medium">Localité</th>
                        <th class="text-right px-4 py-3 font-medium">Demandes</th>
                        <th class="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="c in citoyens.data" :key="c.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td class="px-5 py-3 font-mono text-xs text-gray-600">{{ c.cin }}</td>
                        <td class="px-4 py-3 font-medium text-gray-900">{{ c.prenom }} {{ c.nom }}</td>
                        <td class="px-4 py-3 text-gray-600">{{ c.telephone ?? '—' }}</td>
                        <td class="px-4 py-3 text-gray-500 text-xs">{{ c.commune?.nom ?? '—' }}</td>
                        <td class="px-4 py-3 text-right">
                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold"
                                :class="c.demandes_count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                                {{ c.demandes_count }}
                            </span>
                        </td>
                        <td class="px-5 py-3 text-right">
                            <Link :href="route('citoyens.show', c.id)" class="text-xs text-blue-600 hover:underline font-medium">Voir fiche</Link>
                        </td>
                    </tr>
                    <tr v-if="!citoyens.data?.length">
                        <td colspan="6" class="px-5 py-12 text-center text-sm text-gray-400">Aucun citoyen enregistré.</td>
                    </tr>
                </tbody>
            </table>

            <div v-if="citoyens.last_page > 1" class="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p class="text-xs text-gray-500">{{ citoyens.total }} citoyen(s)</p>
                <div class="flex gap-1">
                    <Link v-for="link in citoyens.links" :key="link.label" :href="link.url ?? ''" v-html="link.label"
                        :class="[link.active ? 'bg-[#1B3A2D] text-white' : 'text-gray-600 hover:bg-gray-100', !link.url ? 'opacity-40 pointer-events-none' : '']"
                        class="px-3 py-1.5 text-xs rounded-lg transition-colors" preserve-scroll />
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';

const props = defineProps({
    citoyens: { type: Object, default: () => ({ data: [], total: 0, last_page: 1, links: [] }) },
    filters:  { type: Object, default: () => ({}) },
});

const search = ref(props.filters.search ?? '');

function applySearch() {
    router.get(route('citoyens.index'), { search: search.value || undefined }, { preserveState: true, replace: true });
}
</script>
