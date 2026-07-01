<template>
    <AppLayout title="Nouvelle demande">
        <div class="max-w-3xl mx-auto">
            <!-- Header + stepper -->
            <div class="mb-8">
                <h1 class="text-xl font-bold text-gray-900 mb-5">Nouvelle demande de prise en charge</h1>
                <div class="flex items-center gap-0">
                    <div v-for="(s, i) in steps" :key="s.id" class="flex items-center flex-1 last:flex-none">
                        <div class="flex flex-col items-center gap-1">
                            <div :class="[
                                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                                step > s.id  ? 'bg-green-600 text-white' :
                                step === s.id ? 'bg-[#1B3A2D] text-white ring-4 ring-[#1B3A2D]/20' :
                                'bg-gray-100 text-gray-400'
                            ]">
                                <svg v-if="step > s.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                                </svg>
                                <span v-else>{{ s.id }}</span>
                            </div>
                            <span class="text-xs font-medium hidden sm:block" :class="step >= s.id ? 'text-gray-800' : 'text-gray-400'">{{ s.label }}</span>
                        </div>
                        <div v-if="i < steps.length - 1" class="flex-1 h-0.5 mx-2 mb-5" :class="step > s.id ? 'bg-green-500' : 'bg-gray-200'" />
                    </div>
                </div>
            </div>

            <!-- Étape 1 — Citoyen -->
            <div v-show="step === 1" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-4">Identification du citoyen</h2>

                <!-- Recherche par CIN -->
                <div class="mb-5">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        Numéro CIN <span class="text-red-500">*</span>
                        <span class="ml-2 text-xs font-normal text-gray-400">12–14 caractères, commence par 1 ou 2</span>
                    </label>
                    <div class="flex gap-2">
                        <input v-model="form.cin" type="text" placeholder="Ex : 1234567890123" maxlength="14"
                            class="flex-1 px-3 py-2.5 text-sm border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D] transition-colors"
                            :class="cinErreurLocale || form.errors.cin ? 'border-red-300 bg-red-50' : (form.cin && cinValide ? 'border-green-400' : 'border-gray-300')"
                            @input="form.cin = form.cin.replace(/[^0-9a-zA-Z]/g, '')" />
                        <button type="button" @click="rechercherCitoyen" :disabled="searching || !cinValide"
                            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                            :class="cinValide ? 'bg-[#1B3A2D] text-white hover:bg-[#254d3c]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                            {{ searching ? '...' : 'Rechercher' }}
                        </button>
                    </div>
                    <!-- Indicateur de longueur -->
                    <div class="flex items-center justify-between mt-1">
                        <p v-if="form.errors.cin || cinErreurLocale" class="text-xs text-red-600">
                            {{ form.errors.cin || cinErreurLocale }}
                        </p>
                        <p v-else-if="form.cin && cinValide" class="text-xs text-green-600 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            Format valide
                        </p>
                        <p v-else class="text-xs text-transparent">.</p>
                        <span class="text-xs" :class="form.cin.length > 14 ? 'text-red-500' : form.cin.length >= 12 ? 'text-green-600' : 'text-gray-400'">
                            {{ form.cin.length }}/14
                        </span>
                    </div>
                </div>

                <!-- Citoyen trouvé -->
                <div v-if="citoyenTrouve" class="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-semibold text-green-800">{{ citoyenTrouve.prenom }} {{ citoyenTrouve.nom }}</p>
                            <p class="text-xs text-green-600">CIN : {{ citoyenTrouve.cin }} — {{ citoyenTrouve.commune?.nom ?? 'Localité non renseignée' }}</p>
                        </div>
                        <button @click="reinitialiserCitoyen" class="text-xs text-green-700 hover:text-green-900 font-medium">Changer</button>
                    </div>
                </div>

                <!-- Formulaire nouveau citoyen -->
                <div v-if="!citoyenTrouve" class="space-y-4">
                    <p class="text-xs text-gray-500 italic">Citoyen non trouvé. Remplissez le formulaire pour créer sa fiche.</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Prénom <span class="text-red-500">*</span></label>
                            <input :value="form.prenom" type="text"
                                @input="form.prenom = capitaliserPrenom($event.target.value)"
                                class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                                :class="form.errors.prenom ? 'border-red-300 bg-red-50' : (form.prenom && prenomValide ? 'border-green-400' : (form.prenom ? 'border-orange-300' : 'border-gray-300'))" />
                            <p v-if="form.errors.prenom" class="mt-1 text-xs text-red-600">{{ form.errors.prenom }}</p>
                            <p v-else-if="form.prenom && !prenomValide" class="mt-1 text-xs text-orange-600">Le prénom doit commencer par une majuscule.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                                Nom <span class="text-red-500">*</span>
                                <span class="ml-1 text-xs font-normal text-gray-400">majuscules uniquement</span>
                            </label>
                            <input :value="form.nom" type="text"
                                @input="form.nom = $event.target.value.toUpperCase()"
                                class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                                :class="form.errors.nom ? 'border-red-300 bg-red-50' : (form.nom ? 'border-green-400' : 'border-gray-300')" />
                            <p v-if="form.errors.nom" class="mt-1 text-xs text-red-600">{{ form.errors.nom }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                                Téléphone
                                <span class="ml-1 text-xs font-normal text-gray-400">+221 7X XXX XX XX</span>
                            </label>
                            <input v-model="form.telephone" type="text" placeholder="+221770000000" maxlength="13"
                                class="w-full px-3 py-2.5 text-sm border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 transition-colors"
                                :class="telErreurLocale(form.telephone) ? 'border-red-300 bg-red-50' : (form.telephone && telValide(form.telephone) ? 'border-green-400' : 'border-gray-300')" />
                            <p v-if="form.errors.telephone" class="mt-1 text-xs text-red-600">{{ form.errors.telephone }}</p>
                            <p v-else-if="form.telephone && telErreurLocale(form.telephone)" class="mt-1 text-xs text-red-600">{{ telErreurLocale(form.telephone) }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Région</label>
                            <select v-model="selectedRegionId" @change="selectedDeptId = ''; form.commune_id = ''" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20">
                                <option value="">— Sélectionner —</option>
                                <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.nom }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Département</label>
                            <select v-model="selectedDeptId" @change="form.commune_id = ''" :disabled="!selectedRegionId" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 disabled:bg-gray-50">
                                <option value="">— Sélectionner —</option>
                                <option v-for="d in departementsDisponibles" :key="d.id" :value="d.id">{{ d.nom }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Commune</label>
                            <select v-model="form.commune_id" :disabled="!selectedDeptId" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 disabled:bg-gray-50">
                                <option value="">— Sélectionner —</option>
                                <option v-for="c in communesDisponibles" :key="c.id" :value="c.id">{{ c.nom }}</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                            <input v-model="form.adresse" type="text" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Étape 2 — Type d'aide -->
            <div v-show="step === 2" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-4">Type d'aide & événement</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Année de gestion <span class="text-red-500">*</span></label>
                        <select v-model="form.annee_gestion_id" @change="checkEligibilite" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                            :class="form.errors.annee_gestion_id ? 'border-red-300' : 'border-gray-300'">
                            <option value="">Sélectionner l'année...</option>
                            <option v-for="a in annees" :key="a.id" :value="a.id">{{ a.annee }}</option>
                        </select>
                        <p v-if="form.errors.annee_gestion_id" class="mt-1 text-xs text-red-600">{{ form.errors.annee_gestion_id }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Type d'aide <span class="text-red-500">*</span></label>
                        <select v-model="form.type_aide_id" @change="form.evenement_id = ''; checkEligibilite()" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]"
                            :class="form.errors.type_aide_id ? 'border-red-300' : 'border-gray-300'">
                            <option value="">Sélectionner un type...</option>
                            <option v-for="t in typesAide" :key="t.id" :value="t.id">{{ t.nom }}</option>
                        </select>
                        <p v-if="form.errors.type_aide_id" class="mt-1 text-xs text-red-600">{{ form.errors.type_aide_id }}</p>
                    </div>
                    <div v-if="evenementsFiltres.length">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Événement</label>
                        <select v-model="form.evenement_id" @change="checkEligibilite" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20 focus:border-[#1B3A2D]">
                            <option value="">— Aucun événement spécifique —</option>
                            <option v-for="e in evenementsFiltres" :key="e.id" :value="e.id">{{ e.nom }}</option>
                        </select>
                    </div>

                    <!-- Alertes eligibilité -->
                    <div v-if="eligibilite.quota_atteint" class="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <p class="text-sm text-red-700">Ce citoyen a atteint le quota de <strong>2 demandes</strong> pour ce type d'aide cette année.</p>
                    </div>

                    <!-- Alertes période (uniquement pour les types qui l'exigent) -->
                    <template v-if="eligibilite.requiert_periode && form.evenement_id && eligibilite.checked">
                        <div v-if="!eligibilite.periode_active" class="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <svg class="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                            <p class="text-sm text-yellow-700">Aucune période d'ouverture active pour cet événement. La soumission est bloquée.</p>
                        </div>
                        <div v-else class="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <svg class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <p class="text-sm text-green-700">Période d'ouverture active — la demande peut être soumise.</p>
                        </div>
                    </template>

                    <!-- Info : types sans contrainte de période -->
                    <div v-if="form.type_aide_id && eligibilite.checked && !eligibilite.requiert_periode"
                        class="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                        </svg>
                        <p class="text-sm text-blue-700">Ce type d'aide est disponible à tout moment — aucune période d'ouverture requise.</p>
                    </div>
                </div>
            </div>

            <!-- Étape 3 — Prestataires -->
            <div v-show="step === 3" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-4">Prestataires & montants</h2>
                <p class="text-xs text-gray-500 mb-4">Sélectionnez un ou plusieurs prestataires et indiquez le montant estimé pour chacun.</p>

                <!-- Liste sélectionnée -->
                <div v-if="form.prestataires.length" class="mb-4 space-y-2">
                    <div v-for="(p, i) in form.prestataires" :key="p.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">{{ prestataireName(p.id) }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <input v-model.number="p.montant_estime" type="number" min="0" placeholder="Montant (FCFA)"
                                class="w-36 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                            <button @click="form.prestataires.splice(i, 1)" class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <p class="text-sm font-semibold text-gray-800">Total estimé : {{ totalFormate }} FCFA</p>
                    </div>
                </div>

                <!-- Ajout prestataire -->
                <div class="border border-dashed border-gray-300 rounded-lg p-4">
                    <p class="text-xs font-medium text-gray-500 mb-3">Ajouter un prestataire</p>
                    <div class="relative mb-2">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input v-model="searchPrestataire" type="text" placeholder="Rechercher un prestataire..."
                            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/20" />
                    </div>
                    <div class="max-h-40 overflow-y-auto space-y-1">
                        <button v-for="p in prestatairesDisponibles" :key="p.id" type="button"
                            @click="ajouterPrestataire(p)"
                            class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-[#1B3A2D]/5 text-left transition-colors">
                            <span class="font-medium text-gray-800">{{ p.nom }}</span>
                            <span class="text-xs text-gray-400">{{ typeLabel(p.type) }}</span>
                        </button>
                        <p v-if="!prestatairesDisponibles.length" class="text-xs text-gray-400 text-center py-3">Aucun prestataire disponible.</p>
                    </div>
                </div>
            </div>

            <!-- Étape 4 — Pièces jointes -->
            <div v-show="step === 4" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-900 mb-1">Pièces justificatives</h2>
                <p class="text-xs text-gray-500 mb-5">Fournissez chaque document requis. Formats acceptés : PDF, JPG, PNG — max 100 Mo par fichier.</p>

                <div class="space-y-3">
                    <div v-for="(doc, i) in documentsRequis" :key="i"
                        class="border rounded-xl p-4 transition-colors"
                        :class="filesDocuments[i] ? 'border-green-200 bg-green-50/20' : 'border-gray-200'">

                        <div class="flex items-start gap-3">
                            <!-- Numéro / Coche -->
                            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors"
                                :class="filesDocuments[i] ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'">
                                <svg v-if="filesDocuments[i]" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                                </svg>
                                <span v-else>{{ i + 1 }}</span>
                            </div>

                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-800 mb-2">
                                    {{ doc.label }}
                                    <span v-if="doc.requis" class="text-red-500 ml-0.5">*</span>
                                </p>

                                <!-- Fichier sélectionné -->
                                <div v-if="filesDocuments[i]"
                                    class="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-lg mb-2">
                                    <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <span class="text-xs text-gray-700 truncate flex-1">{{ filesDocuments[i].name }}</span>
                                    <span class="text-xs text-gray-400 shrink-0">{{ formatFileSize(filesDocuments[i].size) }}</span>
                                    <button type="button" @click="removeDocument(i)"
                                        class="ml-1 p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>

                                <!-- Zone de sélection -->
                                <label class="block border border-dashed rounded-lg px-4 py-2.5 cursor-pointer text-center transition-colors"
                                    :class="filesDocuments[i]
                                        ? 'border-green-300 hover:border-green-400 hover:bg-green-50/30'
                                        : 'border-gray-300 hover:border-[#1B3A2D] hover:bg-[#1B3A2D]/5'">
                                    <p class="text-xs text-gray-500">
                                        {{ filesDocuments[i] ? 'Remplacer le fichier' : 'Cliquez pour sélectionner' }}
                                    </p>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden"
                                        @change="onDocumentFile(i, $event)" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Résumé progression -->
                <div v-if="documentsRequis.length" class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>{{ form.pieces_jointes.length }} / {{ documentsRequis.filter(d => d.requis).length }} document(s) requis fournis</span>
                    <span v-if="peutSoumettre" class="text-green-600 font-medium flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        Dossier complet
                    </span>
                </div>
            </div>

            <!-- Navigation -->
            <div class="flex items-center justify-between mt-6">
                <button v-if="step > 1" @click="step--" type="button"
                    class="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    Retour
                </button>
                <div v-else />

                <div class="flex gap-3">
                    <!-- Sauvegarder en brouillon -->
                    <button v-if="step === 4" type="button" @click="sauvegarder('brouillon')" :disabled="form.processing"
                        class="px-5 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60">
                        Sauvegarder
                    </button>

                    <!-- Suivant ou Soumettre -->
                    <button v-if="step < 4" @click="nextStep" type="button"
                        :disabled="!canProceed"
                        class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] transition-colors disabled:opacity-40">
                        Suivant
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                    <button v-else type="button" @click="sauvegarder('soumettre')" :disabled="form.processing || !peutSoumettre"
                        class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#254d3c] transition-colors disabled:opacity-40">
                        <span v-if="form.processing">Envoi...</span>
                        <span v-else>Enregistrer & soumettre</span>
                    </button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useForm } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';

const props = defineProps({
    typesAide:    { type: Array, default: () => [] },
    periodes:     { type: Array, default: () => [] },
    prestataires: { type: Array, default: () => [] },
    annees:       { type: Array, default: () => [] },
    regions:      { type: Array, default: () => [] },
});

const step = ref(1);
const steps = [
    { id: 1, label: 'Citoyen' },
    { id: 2, label: "Type d'aide" },
    { id: 3, label: 'Prestataires' },
    { id: 4, label: 'Pièces jointes' },
];

const searching       = ref(false);
const citoyenTrouve   = ref(null);
const searchPrestataire = ref('');
const selectedRegionId  = ref('');
const selectedDeptId    = ref('');

const form = useForm({
    // Citoyen
    citoyen_id: null,
    cin: '', nom: '', prenom: '', telephone: '', adresse: '', commune_id: '',
    // Demande
    type_aide_id: '', evenement_id: '', annee_gestion_id: props.annees[0]?.id ?? '',
    periode_ouverture_id: '',
    // Prestataires [{id, montant_estime}]
    prestataires: [],
    // Fichiers
    pieces_jointes: [],
});

const eligibilite = reactive({ checked: false, quota_atteint: false, periode_active: false, requiert_periode: false });

// --- Documents requis par type d'aide ---
const DOCUMENTS_PAR_TYPE = {
    ASSIST_MED: [
        { label: "Demande manuscrite adressée à l'autorité compétente", requis: true },
        { label: "Copie de la pièce nationale d'identité", requis: true },
        { label: "Dossier médical accompagné d'un devis ou d'une facture des frais de soins", requis: true },
        { label: "Certificat d'indigence en cours de validité", requis: true },
    ],
    HOSP: [
        { label: "Demande manuscrite adressée à l'autorité compétente", requis: true },
        { label: "Copie de la pièce nationale d'identité", requis: true },
        { label: "Bulletin d'hospitalisation accompagné d'un devis ou d'une facture des frais", requis: true },
        { label: "Certificat d'indigence en cours de validité", requis: true },
    ],
    EVENT_REL: [
        { label: "Demande manuscrite adressée à l'autorité compétente", requis: true },
        { label: "Copie de la pièce nationale d'identité", requis: true },
        { label: "Attestation de situation socioéconomique ou certificat de résidence", requis: true },
        { label: "Certificat d'indigence en cours de validité", requis: true },
    ],
    URGENCE: [
        { label: "Demande manuscrite adressée à l'autorité compétente", requis: true },
        { label: "Copie de la pièce nationale d'identité", requis: true },
        { label: "Document justificatif de l'urgence sociale (rapport de situation, etc.)", requis: true },
        { label: "Certificat d'indigence en cours de validité", requis: true },
    ],
};

const typeAideCode = computed(() =>
    props.typesAide.find(t => t.id == form.type_aide_id)?.code ?? null
);

const documentsRequis = computed(() =>
    DOCUMENTS_PAR_TYPE[typeAideCode.value] ?? [
        { label: "Document justificatif", requis: true },
    ]
);

const filesDocuments = ref([]);

watch(documentsRequis, (docs) => {
    filesDocuments.value = new Array(docs.length).fill(null);
    form.pieces_jointes = [];
}, { immediate: true });

const TEL_REGEX = /^\+221(70|71|75|76|77|78)[0-9]{7}$/;

function telValide(tel) { return TEL_REGEX.test(tel); }
function telErreurLocale(tel) {
    if (!tel) return '';
    if (!tel.startsWith('+221')) return 'Doit commencer par +221.';
    if (tel.length < 13)  return 'Numéro incomplet.';
    if (tel.length > 13)  return 'Numéro trop long.';
    if (!TEL_REGEX.test(tel)) return 'Indicatif invalide — utilisez 70, 71, 75, 76, 77 ou 78.';
    return '';
}

const cinValide = computed(() => {
    const c = form.cin;
    return c.length >= 12 && c.length <= 14 && /^[12]/.test(c);
});

const cinErreurLocale = computed(() => {
    const c = form.cin;
    if (!c) return '';
    if (!/^[12]/.test(c)) return 'Le CIN doit commencer par 1 ou 2.';
    if (c.length < 12) return `Trop court — ${12 - c.length} caractère(s) manquant(s).`;
    if (c.length > 14) return 'Le CIN ne peut pas dépasser 14 caractères.';
    return '';
});

const NOM_REGEX = /^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ][A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ\s\-']*$/;

const nomValide = computed(() => form.nom.length > 0 && NOM_REGEX.test(form.nom));

const prenomValide = computed(() => form.prenom.length > 0 && /^[A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]/.test(form.prenom));

function capitaliserPrenom(val) {
    if (!val) return '';
    return val.charAt(0).toUpperCase() + val.slice(1);
}

// Computed
const evenementsFiltres = computed(() =>
    props.typesAide.find(t => t.id == form.type_aide_id)?.evenements ?? []
);

const departementsDisponibles = computed(() =>
    props.regions.find(r => r.id == selectedRegionId.value)?.departements ?? []
);
const communesDisponibles = computed(() =>
    departementsDisponibles.value.find(d => d.id == selectedDeptId.value)?.communes ?? []
);

const prestatairesDisponibles = computed(() => {
    const dejaAjoutes = form.prestataires.map(p => p.id);
    return props.prestataires.filter(p =>
        !dejaAjoutes.includes(p.id) &&
        (!searchPrestataire.value || p.nom.toLowerCase().includes(searchPrestataire.value.toLowerCase()))
    );
});

const totalFormate = computed(() =>
    new Intl.NumberFormat('fr-FR').format(form.prestataires.reduce((s, p) => s + (p.montant_estime || 0), 0))
);

const canProceed = computed(() => {
    if (step.value === 1) return cinValide.value && (citoyenTrouve.value || (form.nom && form.prenom));
    if (step.value === 2) {
        if (!form.type_aide_id || !form.annee_gestion_id || eligibilite.quota_atteint) return false;
        // Bloquer si période requise et absente
        if (eligibilite.requiert_periode && form.evenement_id && eligibilite.checked && !eligibilite.periode_active) return false;
        return true;
    }
    return true;
});

const peutSoumettre = computed(() =>
    documentsRequis.value.every((doc, i) => !doc.requis || !!filesDocuments.value[i])
);

// Méthodes
async function rechercherCitoyen() {
    if (!form.cin) return;
    searching.value = true;
    try {
        const res = await fetch(route('citoyens.search') + '?cin=' + encodeURIComponent(form.cin));
        const data = await res.json();
        citoyenTrouve.value = data;
        if (data) {
            form.citoyen_id = data.id;
            form.nom    = data.nom;
            form.prenom = data.prenom;
        } else {
            form.citoyen_id = null;
        }
    } finally {
        searching.value = false;
    }
}

function reinitialiserCitoyen() {
    citoyenTrouve.value = null;
    form.citoyen_id = null;
    form.nom = ''; form.prenom = '';
}

async function checkEligibilite() {
    if (!form.type_aide_id || !form.annee_gestion_id) return;
    const citoyen_id = form.citoyen_id;
    if (!citoyen_id) return;

    const params = new URLSearchParams({
        citoyen_id,
        type_aide_id:     form.type_aide_id,
        annee_gestion_id: form.annee_gestion_id,
        ...(form.evenement_id ? { evenement_id: form.evenement_id } : {}),
    });

    const res = await fetch(route('demandes.eligibilite') + '?' + params);
    const data = await res.json();
    Object.assign(eligibilite, { ...data, checked: true });
}

function nextStep() {
    if (!canProceed.value) return;
    step.value++;
}

function ajouterPrestataire(p) {
    if (!form.prestataires.find(x => x.id === p.id)) {
        form.prestataires.push({ id: p.id, montant_estime: 0 });
    }
    searchPrestataire.value = '';
}

function prestataireName(id) {
    return props.prestataires.find(p => p.id === id)?.nom ?? '';
}

function slugifyLabel(label) {
    return label
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 60);
}

function onDocumentFile(index, e) {
    const raw = e.target.files?.[0] ?? null;
    if (!raw) return;
    const ext = raw.name.includes('.') ? raw.name.split('.').pop() : '';
    const nom = slugifyLabel(documentsRequis.value[index].label) + (ext ? '.' + ext : '');
    const file = new File([raw], nom, { type: raw.type });
    const updated = [...filesDocuments.value];
    updated[index] = file;
    filesDocuments.value = updated;
    form.pieces_jointes = updated.filter(Boolean);
    e.target.value = '';
}

function removeDocument(index) {
    const updated = [...filesDocuments.value];
    updated[index] = null;
    filesDocuments.value = updated;
    form.pieces_jointes = updated.filter(Boolean);
}

function formatFileSize(bytes) {
    const kb = bytes / 1024;
    return kb >= 1024 ? (kb / 1024).toFixed(1) + ' Mo' : Math.round(kb) + ' Ko';
}

function typeLabel(t) {
    return { hopital: 'Hôpital', pharmacie: 'Pharmacie', clinique: 'Clinique', autre: 'Autre' }[t] ?? t;
}

function sauvegarder(mode) {
    form.transform(data => ({
        ...data,
        _soumettre_apres: mode === 'soumettre',
    })).post(route('demandes.store'), {
        forceFormData: true,
    });
}
</script>
