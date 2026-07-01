<template>
    <div class="flex h-screen bg-gray-50 overflow-hidden">
        <!-- Sidebar -->
        <aside
            :class="[
                'flex flex-col transition-all duration-300 shrink-0',
                sidebarOpen ? 'w-64' : 'w-16',
            ]"
            class="bg-[#1B3A2D] text-white"
        >
            <!-- Logo -->
            <div class="flex items-center gap-3 px-4 py-5 border-b border-white/10 min-h-[64px]">
                <div class="w-8 h-8 shrink-0 rounded-full bg-white overflow-hidden flex items-center justify-center p-0.5">
                    <img src="/images/logo.png" alt="Logo DGPSN" class="w-full h-full object-contain" />
                </div>
                <div v-show="sidebarOpen" class="overflow-hidden">
                    <p class="text-sm font-bold leading-tight whitespace-nowrap">DGPSN</p>
                    <p class="text-[10px] text-white/60 whitespace-nowrap">Plateforme de Gestion Sociale</p>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 py-4 overflow-y-auto overflow-x-hidden">

                <!-- Tous les rôles -->
                <NavItem :open="sidebarOpen" href="/dashboard" icon="dashboard" label="Tableau de bord" :active="isActive('/dashboard')" />

                <!-- Agent + Administrateur -->
                <NavGroup v-if="can('demandes.voir')" :open="sidebarOpen" icon="file-text" label="Demandes sociales">
                    <NavItem :open="sidebarOpen" href="/demandes" label="Toutes les demandes" :active="isActive('/demandes')" sub />
                    <NavItem v-if="can('demandes.creer')" :open="sidebarOpen" href="/demandes/create" label="Nouvelle demande" :active="isActive('/demandes/create')" sub />
                </NavGroup>

                <!-- Agent + Administrateur -->
                <NavItem v-if="can('citoyens.voir')" :open="sidebarOpen" href="/citoyens" icon="users" label="Citoyens" :active="isActive('/citoyens')" />

                <!-- Comité + Administrateur -->
                <NavItem v-if="can('demandes.deliberer')" :open="sidebarOpen" href="/comite" icon="committee" label="Comité de délibération" :active="isActive('/comite')" />

                <!-- Administrateur uniquement -->
                <NavGroup v-if="can('referentiels.gerer')" :open="sidebarOpen" icon="book" label="Référentiels">
                    <NavItem :open="sidebarOpen" href="/referentiels/types-aide" label="Types d'aide" :active="isActive('/referentiels/types-aide')" sub />
                    <NavItem :open="sidebarOpen" href="/referentiels/prestataires" label="Prestataires" :active="isActive('/referentiels/prestataires')" sub />
                    <NavItem :open="sidebarOpen" href="/referentiels/evenements" label="Événements" :active="isActive('/referentiels/evenements')" sub />
                    <NavItem :open="sidebarOpen" href="/referentiels/periodes" label="Périodes d'ouverture" :active="isActive('/referentiels/periodes')" sub />
                    <NavItem :open="sidebarOpen" href="/referentiels/annees" label="Années de gestion" :active="isActive('/referentiels/annees')" sub />
                </NavGroup>

                <!-- Tous les rôles -->
                <NavGroup v-if="can('rapports.voir')" :open="sidebarOpen" icon="chart" label="Rapports & Statistiques">
                    <NavItem :open="sidebarOpen" href="/rapports/tableau-de-bord" label="Vue d'ensemble" :active="isActive('/rapports/tableau-de-bord')" sub />
                    <NavItem v-if="can('rapports.exporter')" :open="sidebarOpen" href="/rapports/exports" label="Exports" :active="isActive('/rapports/exports')" sub />
                </NavGroup>

                <!-- Administrateur uniquement -->
                <NavGroup v-if="can('utilisateurs.gerer')" :open="sidebarOpen" icon="user-group" label="Utilisateurs">
                    <NavItem :open="sidebarOpen" href="/utilisateurs" label="Liste des agents" :active="isActive('/utilisateurs')" sub />
                    <NavItem :open="sidebarOpen" href="/utilisateurs/create" label="Ajouter un agent" :active="isActive('/utilisateurs/create')" sub />
                </NavGroup>

                <!-- Tous les rôles -->
                <NavItem :open="sidebarOpen" href="/parametres" icon="settings" label="Paramètres" :active="isActive('/parametres')" />
            </nav>

            <!-- Role badge -->
            <div class="px-4 py-3 border-t border-white/10">
                <div v-show="sidebarOpen" class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-[#F5A623]/20 flex items-center justify-center shrink-0">
                        <svg class="w-3.5 h-3.5 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-[10px] text-white/50">Rôle actuel</p>
                        <p class="text-xs font-semibold text-white">{{ userRole }}</p>
                    </div>
                </div>
                <div v-show="!sidebarOpen" class="flex justify-center">
                    <div class="w-6 h-6 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
                        <svg class="w-3.5 h-3.5 text-[#F5A623]" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main content -->
        <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
            <!-- Topbar -->
            <header class="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 shadow-sm">
                <!-- Toggle sidebar -->
                <button
                    @click="sidebarOpen = !sidebarOpen"
                    class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>

                <div class="flex items-center gap-3 ml-auto">
                    <!-- Date -->
                    <span class="hidden md:flex items-center gap-1.5 text-sm text-gray-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        {{ formattedDate }}
                    </span>

                    <!-- Notifications -->
                    <div class="relative" ref="notifRef">
                        <button @click="notifOpen = !notifOpen"
                            class="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                            </svg>
                            <span v-if="notifCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {{ notifCount > 9 ? '9+' : notifCount }}
                            </span>
                        </button>

                        <!-- Dropdown notifications -->
                        <div v-show="notifOpen"
                            class="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <p class="text-sm font-semibold text-gray-800">Notifications</p>
                                <button v-if="notifications.length" @click="touLire"
                                    class="text-xs text-[#1B3A2D] hover:underline font-medium">
                                    Tout marquer comme lu
                                </button>
                            </div>
                            <div class="max-h-80 overflow-y-auto">
                                <div v-if="!notifications.length" class="px-4 py-8 text-center text-sm text-gray-400">
                                    Aucune nouvelle notification.
                                </div>
                                <div v-for="n in notifications" :key="n.id"
                                    class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer"
                                    @click="ouvrirNotif(n)">
                                    <div class="mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                                        :class="n.statut === 'approuve' ? 'bg-green-100' : 'bg-red-100'">
                                        <svg v-if="n.statut === 'approuve'" class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                        </svg>
                                        <svg v-else class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm text-gray-800 leading-snug">{{ n.message }}</p>
                                        <p class="text-xs text-gray-400 mt-0.5">{{ n.created_at }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- User menu -->
                    <div class="relative" ref="userMenuRef">
                        <button
                            @click="userMenuOpen = !userMenuOpen"
                            class="flex items-center gap-2.5 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
                        >
                            <div class="w-8 h-8 rounded-full bg-[#1B3A2D] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {{ userInitials }}
                            </div>
                            <div class="hidden md:block text-left">
                                <p class="text-sm font-semibold text-gray-800 leading-tight">{{ userName }}</p>
                                <p class="text-xs text-gray-500">{{ userRole }}</p>
                            </div>
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>

                        <!-- Dropdown -->
                        <div
                            v-show="userMenuOpen"
                            class="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                        >
                            <div class="px-4 py-3 border-b border-gray-100">
                                <p class="text-sm font-semibold text-gray-800 truncate">{{ userName }}</p>
                                <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
                            </div>
                            <div class="py-1">
                                <Link
                                    href="/parametres"
                                    class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    @click="userMenuOpen = false"
                                >
                                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    Mon profil
                                </Link>
                            </div>
                            <div class="border-t border-gray-100 py-1">
                                <button
                                    @click="logout"
                                    class="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                    </svg>
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page content -->
            <main class="flex-1 overflow-y-auto p-6">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePage, useForm, Link, router } from '@inertiajs/vue3';
import NavItem from '@/Components/UI/NavItem.vue';
import NavGroup from '@/Components/UI/NavGroup.vue';

const sidebarOpen = ref(true);
const userMenuOpen = ref(false);
const notifOpen    = ref(false);
const userMenuRef  = ref(null);
const notifRef     = ref(null);
const page = usePage();

const userName  = computed(() => page.props.auth?.user?.name  ?? 'Utilisateur');
const userEmail = computed(() => page.props.auth?.user?.email ?? '');
const userRole  = computed(() => {
    const role = page.props.auth?.user?.role;
    const labels = { administrateur: 'Administrateur', agent: 'Agent', comite: 'Comité' };
    return labels[role] ?? 'Utilisateur';
});
const userInitials = computed(() =>
    userName.value.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
);
const permissions = computed(() => page.props.auth?.user?.permissions ?? []);
const notifCount  = computed(() => page.props.auth?.notifications_count ?? 0);
const notifications = computed(() => page.props.auth?.notifications ?? []);

function can(permission) {
    return permissions.value.includes(permission);
}

const formattedDate = computed(() =>
    new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date())
);

function isActive(path) {
    return page.url.startsWith(path);
}

const logoutForm = useForm({});
function logout() {
    logoutForm.post('/logout');
}

function ouvrirNotif(n) {
    router.post(route('notifications.lire-une', n.id), {}, {
        preserveScroll: true,
        onSuccess: () => {
            notifOpen.value = false;
            if (n.demande_id) router.visit(route('demandes.show', n.demande_id));
        },
    });
}

function touLire() {
    router.post(route('notifications.lire'), {}, { preserveScroll: true });
    notifOpen.value = false;
}

function onClickOutside(e) {
    if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
        userMenuOpen.value = false;
    }
    if (notifRef.value && !notifRef.value.contains(e.target)) {
        notifOpen.value = false;
    }
}
onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>
