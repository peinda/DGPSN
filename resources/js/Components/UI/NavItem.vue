<template>
    <Link
        :href="href"
        :class="[
            'flex items-center gap-3 transition-colors duration-150 group relative',
            sub ? 'py-1.5 pr-3' : 'py-2.5 pr-3',
            open ? (sub ? 'pl-10' : 'pl-4') : 'pl-4 justify-center',
            active
                ? 'bg-white/10 text-white font-medium'
                : 'text-white/70 hover:bg-white/5 hover:text-white',
        ]"
    >
        <span v-if="!sub && icon" class="shrink-0 w-5 h-5 flex items-center justify-center">
            <component :is="icons[icon]" class="w-5 h-5" />
        </span>
        <span v-if="sub && open" class="w-1 h-1 rounded-full shrink-0" :class="active ? 'bg-[#F5A623]' : 'bg-white/30'" />
        <span v-show="open" class="text-sm truncate">{{ label }}</span>

        <!-- Active indicator -->
        <span v-if="active" class="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#F5A623] rounded-l" />

        <!-- Tooltip when collapsed -->
        <div
            v-if="!open"
            class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
        >
            {{ label }}
        </div>
    </Link>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import DashboardIcon from './icons/DashboardIcon.vue';
import FileTextIcon from './icons/FileTextIcon.vue';
import UsersIcon from './icons/UsersIcon.vue';
import CommitteeIcon from './icons/CommitteeIcon.vue';
import BookIcon from './icons/BookIcon.vue';
import ChartIcon from './icons/ChartIcon.vue';
import UserGroupIcon from './icons/UserGroupIcon.vue';
import SettingsIcon from './icons/SettingsIcon.vue';

defineProps({
    href: String,
    label: String,
    icon: String,
    active: Boolean,
    open: Boolean,
    sub: { type: Boolean, default: false },
});

const icons = {
    dashboard: DashboardIcon,
    'file-text': FileTextIcon,
    users: UsersIcon,
    committee: CommitteeIcon,
    book: BookIcon,
    chart: ChartIcon,
    'user-group': UserGroupIcon,
    settings: SettingsIcon,
};
</script>
