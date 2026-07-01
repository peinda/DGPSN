<template>
    <div class="flex items-start gap-3">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0', iconBg]">
            <svg v-html="iconPath" :class="['w-4 h-4', iconColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24" />
        </div>
        <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-800 leading-tight">{{ title }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
        </div>
        <span class="text-xs text-gray-400 shrink-0 whitespace-nowrap">{{ time }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    icon:        { type: String, default: 'file' },
    title:       String,
    description: String,
    time:        String,
});

const iconConfig = {
    user: {
        bg: 'bg-green-100', color: 'text-green-600',
        path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
    },
    check: {
        bg: 'bg-teal-100', color: 'text-teal-600',
        path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    },
    file: {
        bg: 'bg-blue-100', color: 'text-blue-600',
        path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
    },
    'user-add': {
        bg: 'bg-purple-100', color: 'text-purple-600',
        path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>',
    },
};

const cfg      = computed(() => iconConfig[props.icon] ?? iconConfig.file);
const iconBg   = computed(() => cfg.value.bg);
const iconColor= computed(() => cfg.value.color);
const iconPath = computed(() => cfg.value.path);
</script>
