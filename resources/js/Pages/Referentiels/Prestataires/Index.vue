<template>
    <AppLayout title="Prestataires">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold text-gray-900">Prestataires agréés</h1>
                <p class="text-sm text-gray-500 mt-0.5">Hôpitaux, pharmacies et cliniques habilités à recevoir les bénéficiaires.</p>
            </div>
            <button @click="openModal()" class="inline-flex items-center gap-2 bg-[#1B3A2D] hover:bg-[#254d3c] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Ajouter
            </button>
        </div>

        <FlashMessage />

        <!-- Filtres -->
        <div class="flex flex-wrap gap-3 mb-5">
            <div class="relative flex-1 min-w-48">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="search" type="text" placeholder="Rechercher un prestataire..." @keyup.enter="applySearch"
                    class="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                <button v-if="search" @click="search = ''; applySearch()"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <select v-model="filterType" @change="applySearch" class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                <option value="">Tous les types</option>
                <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
            <select v-model="filterActif" @change="applySearch" class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                <option value="">Tous les statuts</option>
                <option value="1">Actifs</option>
                <option value="0">Inactifs</option>
            </select>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                        <th class="text-left px-5 py-3 font-medium">Nom</th>
                        <th class="text-left px-4 py-3 font-medium">Type</th>
                        <th class="text-left px-4 py-3 font-medium">Téléphone</th>
                        <th class="text-left px-4 py-3 font-medium">Localité</th>
                        <th class="text-left px-4 py-3 font-medium">Statut</th>
                        <th class="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in prestataires.data" :key="p.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td class="px-5 py-3 font-medium text-gray-900">{{ p.nom }}</td>
                        <td class="px-4 py-3">
                            <span :class="typeClass(p.type)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                                {{ typeLabel(p.type) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-gray-600">{{ p.telephone ?? '—' }}</td>
                        <td class="px-4 py-3 text-gray-600 text-xs">
                            <span v-if="p.commune">{{ p.commune.nom }}</span>
                            <span v-else-if="p.departement">{{ p.departement.nom }}</span>
                            <span v-else-if="p.region">{{ p.region.nom }}</span>
                            <span v-else>—</span>
                        </td>
                        <td class="px-4 py-3">
                            <button @click="toggle(p)" :class="p.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity">
                                {{ p.actif ? 'Actif' : 'Inactif' }}
                            </button>
                        </td>
                        <td class="px-5 py-3">
                            <div class="flex justify-end gap-2">
                                <button @click="openModal(p)" class="text-xs text-blue-600 hover:underline font-medium">Modifier</button>
                                <button @click="confirmDel(p)" class="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!prestataires.data?.length">
                        <td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">Aucun prestataire trouvé.</td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="prestataires.last_page > 1" class="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p class="text-xs text-gray-500">{{ prestataires.total }} prestataire(s)</p>
                <div class="flex gap-1">
                    <Link v-for="link in prestataires.links" :key="link.label" :href="link.url ?? ''" v-html="link.label"
                        :class="[link.active ? 'bg-[#1B3A2D] text-white' : 'text-gray-600 hover:bg-gray-100', !link.url ? 'opacity-40 pointer-events-none' : '']"
                        class="px-3 py-1.5 text-xs rounded-lg transition-colors" preserve-scroll />
                </div>
            </div>
        </div>

        <!-- Modal Create/Edit -->
        <Modal :show="showModal" :title="editing ? 'Modifier le prestataire' : 'Nouveau prestataire'" size="xl" @close="showModal = false">
            <form @submit.prevent="submit" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom <span class="text-red-500">*</span></label>
                        <input v-model="form.nom" type="text" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" :class="form.errors.nom ? 'border-red-300' : 'border-gray-300'" />
                        <p v-if="form.errors.nom" class="mt-1 text-xs text-red-600">{{ form.errors.nom }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Type <span class="text-red-500">*</span></label>
                        <select v-model="form.type" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" :class="form.errors.type ? 'border-red-300' : 'border-gray-300'">
                            <option value="">Sélectionner...</option>
                            <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
                        </select>
                        <p v-if="form.errors.type" class="mt-1 text-xs text-red-600">{{ form.errors.type }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                        <input v-model="form.telephone" type="text" placeholder="77 000 00 00" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                        <p v-if="form.errors.telephone" class="mt-1 text-xs text-red-600">{{ form.errors.telephone }}</p>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input v-model="form.email" type="email" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                        <input v-model="form.adresse" type="text" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Région</label>
                        <select v-model="form.region_id" @change="form.departement_id = ''; form.commune_id = ''" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                            <option value="">Toutes les régions</option>
                            <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.nom }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Département</label>
                        <select v-model="form.departement_id" @change="form.commune_id = ''" :disabled="!form.region_id" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 disabled:bg-gray-50">
                            <option value="">Tous les départements</option>
                            <option v-for="d in departementsFiltres" :key="d.id" :value="d.id">{{ d.nom }}</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Commune</label>
                        <select v-model="form.commune_id" :disabled="!form.departement_id" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 disabled:bg-gray-50">
                            <option value="">Toutes les communes</option>
                            <option v-for="c in communesFiltrees" :key="c.id" :value="c.id">{{ c.nom }}</option>
                        </select>
                    </div>
                    <div class="col-span-2 flex items-center gap-3">
                        <input type="checkbox" v-model="form.actif" id="prest-actif" class="w-4 h-4 rounded border-gray-300 text-[#1B3A2D]" />
                        <label for="prest-actif" class="text-sm text-gray-700">Prestataire actif</label>
                    </div>
                </div>
            </form>
            <template #footer>
                <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="submit" :disabled="form.processing" class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                    {{ form.processing ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Ajouter') }}
                </button>
            </template>
        </Modal>

        <!-- Modal Suppression -->
        <Modal :show="showDelete" title="Supprimer le prestataire" size="sm" @close="showDelete = false">
            <p class="text-sm text-gray-600">Voulez-vous supprimer <strong>{{ deletingItem?.nom }}</strong> ? Cette action est irréversible.</p>
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
import { ref, computed } from 'vue';
import { useForm, Link, router } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import Modal from '@/Components/UI/Modal.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';

const props = defineProps({
    prestataires: { type: Object, default: () => ({ data: [], links: [], total: 0, last_page: 1 }) },
    regions:      { type: Array,  default: () => [] },
    filters:      { type: Object, default: () => ({}) },
});

const search      = ref(props.filters.search ?? '');
const filterType  = ref(props.filters.type   ?? '');
const filterActif = ref(props.filters.actif  ?? '');

const types = [
    { value: 'hopital',   label: 'Hôpital' },
    { value: 'pharmacie', label: 'Pharmacie' },
    { value: 'clinique',  label: 'Clinique' },
    { value: 'autre',     label: 'Autre' },
];

function applySearch() {
    router.get(route('referentiels.prestataires.index'), {
        search: search.value || undefined,
        type:   filterType.value || undefined,
        actif:  filterActif.value !== '' ? filterActif.value : undefined,
    }, { preserveState: true, replace: true });
}

const showModal = ref(false);
const editing   = ref(null);
const form = useForm({ nom: '', type: '', adresse: '', telephone: '', email: '', region_id: '', departement_id: '', commune_id: '', actif: true });

const departementsFiltres = computed(() =>
    props.regions.find(r => r.id == form.region_id)?.departements ?? []
);
const communesFiltrees = computed(() =>
    departementsFiltres.value.find(d => d.id == form.departement_id)?.communes ?? []
);

function openModal(p = null) {
    editing.value = p;
    if (p) {
        Object.assign(form, {
            nom: p.nom, type: p.type, adresse: p.adresse ?? '', telephone: p.telephone ?? '',
            email: p.email ?? '', region_id: p.region_id ?? '', departement_id: p.departement_id ?? '',
            commune_id: p.commune_id ?? '', actif: p.actif,
        });
    } else {
        form.reset(); form.actif = true;
    }
    showModal.value = true;
}

function submit() {
    const opts = { onSuccess: () => { showModal.value = false; form.reset(); } };
    if (editing.value) {
        form.put(route('referentiels.prestataires.update', editing.value.id), opts);
    } else {
        form.post(route('referentiels.prestataires.store'), opts);
    }
}

function toggle(p) {
    router.patch(route('referentiels.prestataires.toggle', p.id), {}, { preserveScroll: true });
}

const showDelete    = ref(false);
const deletingItem  = ref(null);
const deleteForm    = useForm({});

function confirmDel(p) { deletingItem.value = p; showDelete.value = true; }
function execDelete() {
    deleteForm.delete(route('referentiels.prestataires.destroy', deletingItem.value.id), {
        onSuccess: () => { showDelete.value = false; },
    });
}

function typeLabel(t) { return types.find(x => x.value === t)?.label ?? t; }
function typeClass(t) {
    return {
        hopital:   'bg-blue-100 text-blue-700',
        pharmacie: 'bg-green-100 text-green-700',
        clinique:  'bg-purple-100 text-purple-700',
        autre:     'bg-gray-100 text-gray-600',
    }[t] ?? 'bg-gray-100 text-gray-600';
}
</script>
