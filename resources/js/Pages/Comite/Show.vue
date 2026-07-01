<template>
    <AppLayout :title="`Délibération — ${demande.reference}`">
        <div class="max-w-5xl mx-auto">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <Link :href="route('comite.index')" class="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </Link>
                    <div>
                        <h1 class="text-xl font-bold text-gray-900">{{ demande.reference }}</h1>
                        <p class="text-sm text-gray-500">Soumise le {{ formatDate(demande.date_soumission) }} par {{ demande.agent?.name }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <StatusBadge :status="demande.statut" />
                    <!-- Bouton Prendre en examen -->
                    <button v-if="demande.statut === 'soumis'" @click="examinerForm.post(route('comite.examiner', demande.id))"
                        :disabled="examinerForm.processing"
                        class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-60">
                        Prendre en examen
                    </button>
                    <!-- Boutons délibération -->
                    <template v-if="demande.statut === 'en_examen'">
                        <button @click="showRejetModal = true"
                            class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
                            Rejeter
                        </button>
                        <button @click="showApprouverModal = true"
                            class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                            Approuver
                        </button>
                    </template>
                    <!-- Télécharger PDF si approuvé -->
                    <a v-if="demande.statut === 'approuve'" :href="route('comite.bon-pdf', demande.id)" target="_blank"
                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] hover:bg-[#254d3c] rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Télécharger le bon PDF
                    </a>
                </div>
            </div>

            <FlashMessage />

            <div class="grid grid-cols-3 gap-5">
                <!-- Colonne principale -->
                <div class="col-span-2 space-y-5">

                    <!-- Citoyen -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                Citoyen bénéficiaire
                            </h2>
                            <span v-if="estRecurrent" class="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-semibold">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                Citoyen récurrent
                            </span>
                        </div>
                        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div><dt class="text-xs text-gray-400">Nom complet</dt><dd class="font-semibold text-gray-900">{{ demande.citoyen?.prenom }} {{ demande.citoyen?.nom }}</dd></div>
                            <div><dt class="text-xs text-gray-400">CIN</dt><dd class="font-mono text-gray-700">{{ demande.citoyen?.cin }}</dd></div>
                            <div><dt class="text-xs text-gray-400">Téléphone</dt><dd class="text-gray-700">{{ demande.citoyen?.telephone ?? '—' }}</dd></div>
                            <div><dt class="text-xs text-gray-400">Localité</dt><dd class="text-gray-700">{{ demande.citoyen?.commune?.nom ?? '—' }}</dd></div>
                        </dl>

                        <!-- Historique -->
                        <div v-if="autresDemandes.length" class="mt-4 pt-4 border-t border-gray-100">
                            <p class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Historique des demandes</p>
                            <div class="space-y-2">
                                <div v-for="d in autresDemandes" :key="d.id"
                                    class="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg">
                                    <div>
                                        <span class="font-medium text-gray-700">{{ d.type_aide?.nom }}</span>
                                        <span class="text-gray-400 ml-2">{{ d.annee_gestion?.annee }}</span>
                                    </div>
                                    <StatusBadge :status="d.statut" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pièces jointes -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                            Pièces justificatives
                            <span class="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{{ demande.pieces_jointes?.length ?? 0 }}</span>
                        </h2>
                        <div v-if="demande.pieces_jointes?.length" class="grid grid-cols-2 gap-2">
                            <a v-for="p in demande.pieces_jointes" :key="p.id"
                                :href="`/storage/${p.chemin}`" target="_blank"
                                class="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-[#1B3A2D] hover:bg-green-50/30 transition-colors group">
                                <div class="w-8 h-8 rounded bg-red-50 flex items-center justify-center shrink-0">
                                    <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                </div>
                                <div class="min-w-0">
                                    <p class="text-xs font-medium text-gray-800 truncate group-hover:text-[#1B3A2D]">{{ p.nom_original }}</p>
                                    <p class="text-xs text-gray-400">{{ formatBytes(p.taille) }}</p>
                                </div>
                            </a>
                        </div>
                        <p v-else class="text-sm text-red-500 font-medium">⚠ Aucune pièce jointe.</p>
                    </div>

                    <!-- Commentaire de rejet -->
                    <div v-if="demande.statut === 'rejete' && demande.commentaire" class="bg-red-50 border border-red-200 rounded-xl p-5">
                        <h2 class="text-sm font-semibold text-red-700 mb-2">Motif de rejet</h2>
                        <p class="text-sm text-red-700 leading-relaxed">{{ demande.commentaire }}</p>
                    </div>
                </div>

                <!-- Colonne latérale -->
                <div class="space-y-4">
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 class="text-sm font-semibold text-gray-700 mb-4">Détails de la demande</h2>
                        <dl class="space-y-3 text-sm">
                            <div><dt class="text-xs text-gray-400 mb-0.5">Référence</dt><dd class="font-mono font-semibold text-gray-900">{{ demande.reference }}</dd></div>
                            <div><dt class="text-xs text-gray-400 mb-0.5">Type d'aide</dt><dd class="font-semibold text-gray-900">{{ demande.type_aide?.nom }}</dd></div>
                            <div><dt class="text-xs text-gray-400 mb-0.5">Événement</dt><dd class="text-gray-700">{{ demande.evenement?.nom ?? '—' }}</dd></div>
                            <div><dt class="text-xs text-gray-400 mb-0.5">Année</dt><dd class="text-gray-700">{{ demande.annee_gestion?.annee }}</dd></div>
                        </dl>
                    </div>

                    <!-- Prestataires -->
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 class="text-sm font-semibold text-gray-700 mb-4">Prestataires</h2>
                        <div v-if="demande.prestataires?.length" class="space-y-2">
                            <div v-for="p in demande.prestataires" :key="p.id" class="p-3 bg-gray-50 rounded-lg">
                                <p class="text-sm font-medium text-gray-900">{{ p.nom }}</p>
                                <p class="text-xs text-gray-400 mt-0.5">{{ p.commune?.nom ?? '—' }}</p>
                                <p class="text-sm font-bold text-gray-800 mt-1">{{ formatMontant(p.pivot?.montant_estime) }} FCFA</p>
                            </div>
                            <div class="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold text-gray-900">
                                <span>Total</span>
                                <span>{{ formatMontant(demande.montant_total) }} FCFA</span>
                            </div>
                        </div>
                        <p v-else class="text-sm text-gray-400">Aucun prestataire.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Approuver -->
        <Modal :show="showApprouverModal" title="Approuver la demande" size="md" @close="showApprouverModal = false">
            <div class="space-y-4">
                <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p class="text-sm text-green-800">Vous êtes sur le point d'approuver la demande <strong>{{ demande.reference }}</strong>. Un bon PDF sera généré automatiquement.</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Commentaire (optionnel)</label>
                    <textarea v-model="approuverForm.commentaire" rows="3" placeholder="Observation du comité..."
                        class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none" />
                </div>
            </div>
            <template #footer>
                <button @click="showApprouverModal = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="approuver" :disabled="approuverForm.processing"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-60">
                    {{ approuverForm.processing ? 'Approbation...' : 'Confirmer l\'approbation' }}
                </button>
            </template>
        </Modal>

        <!-- Modal Rejeter -->
        <Modal :show="showRejetModal" title="Rejeter la demande" size="md" @close="showRejetModal = false">
            <div class="space-y-4">
                <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-800">Vous êtes sur le point de rejeter la demande <strong>{{ demande.reference }}</strong>.</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Motif de rejet <span class="text-red-500">*</span></label>
                    <textarea v-model="rejetForm.commentaire" rows="4" placeholder="Expliquez le motif du rejet (obligatoire, min. 10 caractères)..."
                        class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                        :class="rejetForm.errors.commentaire ? 'border-red-400' : 'border-gray-300 focus:border-red-400'" />
                    <p v-if="rejetForm.errors.commentaire" class="mt-1 text-xs text-red-600">{{ rejetForm.errors.commentaire }}</p>
                </div>
            </div>
            <template #footer>
                <button @click="showRejetModal = false" class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                <button @click="rejeter" :disabled="rejetForm.processing || !rejetForm.commentaire"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60">
                    {{ rejetForm.processing ? 'Rejet...' : 'Confirmer le rejet' }}
                </button>
            </template>
        </Modal>
    </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link, useForm } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import FlashMessage from '@/Components/UI/FlashMessage.vue';
import StatusBadge from '@/Components/UI/StatusBadge.vue';
import Modal from '@/Components/UI/Modal.vue';

const props = defineProps({ demande: { type: Object, required: true } });

const showApprouverModal = ref(false);
const showRejetModal     = ref(false);

const examinerForm  = useForm({});
const approuverForm = useForm({ commentaire: '' });
const rejetForm     = useForm({ commentaire: '' });

const estRecurrent = computed(() => {
    const annee = props.demande.annee_gestion?.annee;
    return props.demande.citoyen?.demandes?.some(d =>
        d.id !== props.demande.id &&
        d.statut === 'approuve' &&
        d.annee_gestion?.annee < annee
    ) ?? false;
});

const autresDemandes = computed(() =>
    props.demande.citoyen?.demandes?.filter(d => d.id !== props.demande.id) ?? []
);

function approuver() {
    approuverForm.post(route('comite.approuver', props.demande.id), {
        onSuccess: () => { showApprouverModal.value = false; },
    });
}

function rejeter() {
    rejetForm.post(route('comite.rejeter', props.demande.id), {
        onSuccess: () => { showRejetModal.value = false; },
    });
}

function formatDate(d)    { return d ? new Date(d).toLocaleDateString('fr-FR') : '—'; }
function formatMontant(n) { return n ? new Intl.NumberFormat('fr-FR').format(n) : '0'; }
function formatBytes(b)   { const k = b / 1024; return k >= 1024 ? (k/1024).toFixed(1)+' Mo' : Math.round(k)+' Ko'; }
</script>
