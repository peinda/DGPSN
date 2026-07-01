<template>
    <AppLayout :title="`Demande ${demande.reference ?? '—'}`">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <Link :href="route('demandes.index')" class="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </Link>
                    <div>
                        <h1 class="text-xl font-bold text-gray-900">{{ demande.reference ?? 'Brouillon' }}</h1>
                        <p class="text-sm text-gray-500">Créée le {{ formatDate(demande.created_at) }} par {{ demande.agent?.name }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <StatusBadge :status="demande.statut" />
                    <template v-if="demande.statut === 'brouillon' && can('demandes.creer')">
                        <Link :href="route('demandes.edit', demande.id)"
                            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                            Modifier
                        </Link>
                        <button @click="soumettre"
                            :disabled="soumetForm.processing || !demande.pieces_jointes?.length"
                            class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors disabled:opacity-50">
                            Soumettre au comité
                        </button>
                        <button @click="confirmerSuppression = true"
                            class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            Supprimer
                        </button>
                    </template>
                </div>
            </div>

            <FlashMessage />

            <div class="grid grid-cols-3 gap-5">
                <!-- Colonne principale -->
                <div class="col-span-2 space-y-5">
                    <!-- Citoyen -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                            Citoyen bénéficiaire
                            <span v-if="demande.citoyen && estRecurrent" class="ml-auto inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                Récurrent
                            </span>
                        </h2>
                        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div><dt class="text-gray-500 text-xs">Nom complet</dt><dd class="font-medium text-gray-900">{{ demande.citoyen?.prenom }} {{ demande.citoyen?.nom }}</dd></div>
                            <div><dt class="text-gray-500 text-xs">CIN</dt><dd class="font-mono text-gray-700">{{ demande.citoyen?.cin }}</dd></div>
                            <div><dt class="text-gray-500 text-xs">Téléphone</dt><dd class="text-gray-700">{{ demande.citoyen?.telephone ?? '—' }}</dd></div>
                            <div><dt class="text-gray-500 text-xs">Localité</dt><dd class="text-gray-700">{{ demande.citoyen?.commune?.nom ?? '—' }}</dd></div>
                        </dl>
                        <div v-if="demande.citoyen?.demandes?.length > 1" class="mt-4 pt-4 border-t border-gray-100">
                            <p class="text-xs font-medium text-gray-500 mb-2">Historique des demandes</p>
                            <div class="space-y-1.5">
                                <div v-for="d in autresDemandes" :key="d.id" class="flex items-center justify-between text-xs">
                                    <span class="text-gray-600">{{ d.type_aide?.nom }} — {{ d.annee_gestion?.annee }}</span>
                                    <StatusBadge :status="d.statut" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Prestataires -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            Prestataires
                        </h2>
                        <div v-if="demande.prestataires?.length" class="space-y-2">
                            <div v-for="p in demande.prestataires" :key="p.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p class="text-sm font-medium text-gray-900">{{ p.nom }}</p>
                                    <p class="text-xs text-gray-400">{{ p.commune?.nom ?? p.departement?.nom ?? '—' }}</p>
                                </div>
                                <div class="text-right flex flex-col items-end gap-1">
                                    <p class="text-sm font-semibold text-gray-800">{{ formatMontant(p.pivot.montant_estime) }} FCFA</p>
                                    <span v-if="p.pivot.confirme" class="text-xs text-green-600 font-medium flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                                        Prestation confirmée
                                    </span>
                                    <button v-else-if="demande.statut === 'approuve' && can('demandes.creer')"
                                        @click="confirmerPrestation(p)"
                                        :disabled="confirmForms[p.id]?.processing"
                                        class="text-xs text-[#1B3A2D] border border-[#1B3A2D] hover:bg-[#1B3A2D] hover:text-white px-2 py-0.5 rounded-md transition-colors font-medium disabled:opacity-50">
                                        Confirmer prestation
                                    </button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                                <p class="text-sm font-bold text-gray-900">Total : {{ formatMontant(demande.montant_total) }} FCFA</p>
                                <button v-if="demande.statut === 'approuve' && can('demandes.creer')"
                                    @click="cloturerForm.post(route('demandes.cloturer', demande.id))"
                                    :disabled="cloturerForm.processing"
                                    class="text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                                    Clôturer la demande
                                </button>
                            </div>
                        </div>
                        <p v-else class="text-sm text-gray-400">Aucun prestataire sélectionné.</p>
                    </div>

                    <!-- Pièces jointes -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                                Pièces jointes
                                <span class="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{{ demande.pieces_jointes?.length ?? 0 }}</span>
                            </h2>
                            <!-- Upload si brouillon -->
                            <label v-if="demande.statut === 'brouillon'" class="cursor-pointer text-xs text-[#1B3A2D] font-medium hover:underline">
                                + Ajouter
                                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" class="hidden" @change="uploadFichiers" />
                            </label>
                        </div>
                        <div v-if="demande.pieces_jointes?.length" class="space-y-2">
                            <div v-for="p in demande.pieces_jointes" :key="p.id" class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                                <svg class="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm text-gray-800 truncate">{{ p.nom_original }}</p>
                                    <p class="text-xs text-gray-400">{{ formatBytes(p.taille) }}</p>
                                </div>
                                <a :href="`/storage/${p.chemin}`" target="_blank" class="text-xs text-blue-600 hover:underline">Ouvrir</a>
                                <button v-if="demande.statut === 'brouillon'" @click="supprimerPiece(p)"
                                    class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>
                        <p v-else class="text-sm text-gray-400">Aucune pièce jointe.</p>
                    </div>
                </div>

                <!-- Colonne latérale -->
                <div class="space-y-4">
                    <!-- Informations demande -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 class="text-sm font-semibold text-gray-700 mb-4">Informations</h2>
                        <dl class="space-y-3 text-sm">
                            <div><dt class="text-xs text-gray-400 mb-0.5">Référence</dt><dd class="font-mono font-semibold text-gray-900">{{ demande.reference ?? '—' }}</dd></div>
                            <div><dt class="text-xs text-gray-400 mb-0.5">Type d'aide</dt><dd class="font-medium text-gray-900">{{ demande.type_aide?.nom }}</dd></div>
                            <div><dt class="text-xs text-gray-400 mb-0.5">Événement</dt><dd class="text-gray-700">{{ demande.evenement?.nom ?? '—' }}</dd></div>
                            <div><dt class="text-xs text-gray-400 mb-0.5">Année</dt><dd class="text-gray-700">{{ demande.annee_gestion?.annee }}</dd></div>
                            <div v-if="demande.date_soumission"><dt class="text-xs text-gray-400 mb-0.5">Soumise le</dt><dd class="text-gray-700">{{ formatDate(demande.date_soumission) }}</dd></div>
                            <div v-if="demande.date_deliberation"><dt class="text-xs text-gray-400 mb-0.5">Délibérée le</dt><dd class="text-gray-700">{{ formatDate(demande.date_deliberation) }}</dd></div>
                            <div v-if="demande.comite_user"><dt class="text-xs text-gray-400 mb-0.5">Délibérée par</dt><dd class="text-gray-700">{{ demande.comite_user?.name }}</dd></div>
                        </dl>
                    </div>

                    <!-- Commentaire -->
                    <div v-if="demande.commentaire" class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 class="text-sm font-semibold text-gray-700 mb-2">Commentaire</h2>
                        <p class="text-sm text-gray-600 leading-relaxed">{{ demande.commentaire }}</p>
                    </div>

                    <!-- Avertissement si brouillon sans pièces -->
                    <div v-if="demande.statut === 'brouillon' && !demande.pieces_jointes?.length" class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p class="text-xs text-yellow-800 font-medium">Action requise</p>
                        <p class="text-xs text-yellow-700 mt-1">Ajoutez au moins une pièce justificative avant de soumettre.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirmation suppression -->
        <Modal :show="confirmerSuppression" title="Supprimer la demande" size="sm" @close="confirmerSuppression = false">
            <p class="text-sm text-gray-600">Voulez-vous supprimer définitivement la demande <strong>{{ demande.reference ?? 'en brouillon' }}</strong> ?</p>
            <template #footer>
                <button @click="confirmerSuppression = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="supprimerDemande" :disabled="deleteForm.processing" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">Supprimer</button>
            </template>
        </Modal>
    </AppLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { Link, useForm, router, usePage } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';
import StatusBadge from '@/Components/UI/StatusBadge.vue';
import Modal from '@/Components/UI/Modal.vue';

const props = defineProps({ demande: { type: Object, required: true } });

const page = usePage();
const permissions = computed(() => page.props.auth?.user?.permissions ?? []);
function can(p) { return permissions.value.includes(p); }

const confirmerSuppression = ref(false);
const soumetForm    = useForm({});
const deleteForm    = useForm({});
const cloturerForm  = useForm({});
const uploadForm    = useForm({ fichiers: [] });
const confirmForms  = reactive({});

const estRecurrent = computed(() => {
    const anneeActuelle = new Date().getFullYear();
    return props.demande.citoyen?.demandes?.some(d =>
        d.id !== props.demande.id &&
        d.statut === 'approuve' &&
        d.annee_gestion?.annee < anneeActuelle
    ) ?? false;
});

const autresDemandes = computed(() =>
    props.demande.citoyen?.demandes?.filter(d => d.id !== props.demande.id) ?? []
);

function soumettre() {
    soumetForm.post(route('demandes.soumettre', props.demande.id));
}

function supprimerDemande() {
    deleteForm.delete(route('demandes.destroy', props.demande.id), {
        onSuccess: () => router.visit(route('demandes.index')),
    });
}

function uploadFichiers(e) {
    const files = Array.from(e.target.files ?? []);
    uploadForm.fichiers = files;
    uploadForm.post(route('pieces-jointes.store', props.demande.id), {
        forceFormData: true,
        onSuccess: () => router.reload({ only: ['demande'] }),
    });
    e.target.value = '';
}

function supprimerPiece(piece) {
    router.delete(route('pieces-jointes.destroy', { demande: props.demande.id, pieceJointe: piece.id }));
}

function confirmerPrestation(prestataire) {
    if (!confirmForms[prestataire.id]) {
        confirmForms[prestataire.id] = useForm({});
    }
    confirmForms[prestataire.id].post(
        route('demandes.prestataires.confirmer', { demande: props.demande.id, prestataire: prestataire.id })
    );
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : '—'; }
function formatMontant(n) { return n ? new Intl.NumberFormat('fr-FR').format(n) : '0'; }
function formatBytes(b) { const k = b / 1024; return k >= 1024 ? (k/1024).toFixed(1)+' Mo' : Math.round(k)+' Ko'; }
</script>
