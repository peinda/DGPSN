<template>
    <AppLayout :title="`Fiche — ${citoyen.prenom} ${citoyen.nom}`">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <Link :href="route('citoyens.index')" class="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </Link>
                    <div>
                        <h1 class="text-xl font-bold text-gray-900">{{ citoyen.prenom }} {{ citoyen.nom }}</h1>
                        <p class="text-sm text-gray-500 font-mono">CIN : {{ citoyen.cin }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span v-if="estRecurrent" class="inline-flex items-center gap-1.5 text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full font-semibold">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        Citoyen récurrent
                    </span>
                    <button v-if="can('citoyens.creer')" @click="ouvrirEdition"
                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Modifier la fiche
                    </button>
                    <Link v-if="can('demandes.creer')" :href="route('demandes.create')"
                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1B3A2D] border border-[#1B3A2D] hover:bg-[#1B3A2D]/5 rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Nouvelle demande
                    </Link>
                </div>
            </div>

            <FlashMessage />

            <div class="grid grid-cols-3 gap-5">
                <!-- Informations citoyen -->
                <div class="col-span-1 space-y-4">
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <!-- Avatar initiales -->
                        <div class="w-14 h-14 rounded-full bg-[#1B3A2D] text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                            {{ initiales }}
                        </div>
                        <h2 class="text-center font-semibold text-gray-900 mb-1">{{ citoyen.prenom }} {{ citoyen.nom }}</h2>
                        <p class="text-center text-xs text-gray-400 font-mono mb-4">{{ citoyen.cin }}</p>

                        <dl class="space-y-3 text-sm">
                            <div class="flex items-start gap-2">
                                <svg class="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                <span class="text-gray-600">{{ citoyen.telephone ?? 'Non renseigné' }}</span>
                            </div>
                            <div class="flex items-start gap-2">
                                <svg class="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                <div>
                                    <p class="text-gray-600">{{ citoyen.commune?.nom ?? '—' }}</p>
                                    <p class="text-xs text-gray-400">{{ citoyen.commune?.departement?.region?.nom ?? '' }}</p>
                                </div>
                            </div>
                            <div v-if="citoyen.adresse" class="flex items-start gap-2">
                                <svg class="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                </svg>
                                <span class="text-gray-600">{{ citoyen.adresse }}</span>
                            </div>
                        </dl>
                    </div>

                    <!-- Stats rapides -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Statistiques</h3>
                        <div class="space-y-2">
                            <div v-for="stat in statsStatut" :key="stat.label" class="flex items-center justify-between text-sm">
                                <span class="text-gray-600">{{ stat.label }}</span>
                                <span class="font-semibold text-gray-800">{{ stat.count }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Historique des demandes -->
                <div class="col-span-2">
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 class="text-sm font-semibold text-gray-800">
                                Historique des demandes
                                <span class="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{{ citoyen.demandes?.length ?? 0 }}</span>
                            </h2>
                        </div>

                        <div v-if="citoyen.demandes?.length">
                            <div v-for="d in demandesTriees" :key="d.id"
                                class="flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                                <!-- Icône statut -->
                                <div :class="iconClass(d.statut)" class="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path v-if="d.statut === 'approuve'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                        <path v-else-if="d.statut === 'rejete'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-0.5">
                                        <span class="text-sm font-semibold text-gray-900">{{ d.type_aide?.nom }}</span>
                                        <span v-if="d.evenement" class="text-xs text-gray-400">— {{ d.evenement.nom }}</span>
                                    </div>
                                    <div class="flex items-center gap-3 text-xs text-gray-400">
                                        <span class="font-mono">{{ d.reference ?? '—' }}</span>
                                        <span>{{ d.annee_gestion?.annee }}</span>
                                        <span>{{ formatDate(d.created_at) }}</span>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <span v-if="d.montant_total" class="text-sm font-semibold text-gray-700">
                                        {{ formatMontant(d.montant_total) }} F
                                    </span>
                                    <StatusBadge :status="d.statut" />
                                    <Link :href="route('demandes.show', d.id)" class="p-1.5 text-gray-400 hover:text-[#1B3A2D] hover:bg-gray-100 rounded-lg transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div v-else class="px-5 py-14 text-center">
                            <svg class="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <p class="text-sm text-gray-400">Aucune demande enregistrée.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal édition citoyen -->
        <Modal :show="showEdit" title="Modifier la fiche citoyen" size="lg" @close="showEdit = false">
            <form @submit.prevent="sauvegarder" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Prénom <span class="text-red-500">*</span></label>
                        <input v-model="editForm.prenom" type="text" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                            :class="editForm.errors.prenom ? 'border-red-300' : 'border-gray-300'" />
                        <p v-if="editForm.errors.prenom" class="mt-1 text-xs text-red-600">{{ editForm.errors.prenom }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom <span class="text-red-500">*</span></label>
                        <input v-model="editForm.nom" type="text" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                            :class="editForm.errors.nom ? 'border-red-300' : 'border-gray-300'" />
                        <p v-if="editForm.errors.nom" class="mt-1 text-xs text-red-600">{{ editForm.errors.nom }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                        <input v-model="editForm.telephone" type="text" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                        <p v-if="editForm.errors.telephone" class="mt-1 text-xs text-red-600">{{ editForm.errors.telephone }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">CIN</label>
                        <input :value="citoyen.cin" type="text" disabled class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 font-mono" />
                        <p class="mt-1 text-xs text-gray-400">Le CIN ne peut pas être modifié.</p>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                        <input v-model="editForm.adresse" type="text" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                    </div>
                </div>
            </form>
            <template #footer>
                <button @click="showEdit = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="sauvegarder" :disabled="editForm.processing" class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] disabled:opacity-60">
                    {{ editForm.processing ? 'Enregistrement...' : 'Sauvegarder' }}
                </button>
            </template>
        </Modal>
    </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link, useForm, usePage } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';
import StatusBadge from '@/Components/UI/StatusBadge.vue';
import Modal from '@/Components/UI/Modal.vue';

const props = defineProps({ citoyen: { type: Object, required: true } });

const page = usePage();
const permissions = computed(() => page.props.auth?.user?.permissions ?? []);
function can(p) { return permissions.value.includes(p); }

const showEdit = ref(false);
const editForm = useForm({
    prenom:    props.citoyen.prenom,
    nom:       props.citoyen.nom,
    telephone: props.citoyen.telephone ?? '',
    adresse:   props.citoyen.adresse   ?? '',
});

const initiales = computed(() =>
    [props.citoyen.prenom[0], props.citoyen.nom[0]].join('').toUpperCase()
);

const estRecurrent = computed(() => {
    const anneeActuelle = new Date().getFullYear();
    return props.citoyen.demandes?.some(d =>
        d.statut === 'approuve' && d.annee_gestion?.annee < anneeActuelle
    ) ?? false;
});

const demandesTriees = computed(() =>
    [...(props.citoyen.demandes ?? [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
);

const statsStatut = computed(() => {
    const demandes = props.citoyen.demandes ?? [];
    return [
        { label: 'Total',     count: demandes.length },
        { label: 'Approuvées', count: demandes.filter(d => d.statut === 'approuve').count ?? demandes.filter(d => d.statut === 'approuve').length },
        { label: 'En cours',  count: demandes.filter(d => ['soumis','en_examen','brouillon'].includes(d.statut)).length },
        { label: 'Rejetées',  count: demandes.filter(d => d.statut === 'rejete').length },
    ];
});

function ouvrirEdition() {
    editForm.prenom    = props.citoyen.prenom;
    editForm.nom       = props.citoyen.nom;
    editForm.telephone = props.citoyen.telephone ?? '';
    editForm.adresse   = props.citoyen.adresse   ?? '';
    showEdit.value = true;
}

function sauvegarder() {
    editForm.put(route('citoyens.update', props.citoyen.id), {
        onSuccess: () => { showEdit.value = false; },
    });
}

function iconClass(statut) {
    return {
        approuve:  'bg-green-100 text-green-600',
        rejete:    'bg-red-100 text-red-500',
        cloture:   'bg-gray-100 text-gray-400',
        soumis:    'bg-blue-100 text-blue-500',
        en_examen: 'bg-purple-100 text-purple-500',
        brouillon: 'bg-gray-100 text-gray-400',
    }[statut] ?? 'bg-gray-100 text-gray-400';
}

function formatDate(d)    { return d ? new Date(d).toLocaleDateString('fr-FR') : '—'; }
function formatMontant(n) { return n ? new Intl.NumberFormat('fr-FR').format(n) : '0'; }
</script>
