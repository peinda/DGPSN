<template>
    <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-start gap-3">
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', iconBg]">
            <svg v-html="iconSvgPath" :class="['w-5 h-5', iconColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24" />
        </div>
        <div class="min-w-0">
            <p class="text-xs text-gray-500 leading-tight truncate">{{ label }}</p>
            <p class="text-xl font-bold text-gray-900 leading-tight">{{ formattedValue }}</p>
            <div class="flex items-center gap-1 mt-0.5">
                <svg :class="['w-3 h-3', trend >= 0 ? 'text-green-500' : 'text-red-500']" fill="currentColor" viewBox="0 0 20 20">
                    <path v-if="trend >= 0" fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    <path v-else fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span :class="['text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-600']">
                    {{ Math.abs(trend) }}% ce mois
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    label: String,
    value: { type: Number, default: 0 },
    trend: { type: Number, default: 0 },
    color: { type: String, default: 'green' },
    icon: { type: String, default: 'file' },
});

const formattedValue = computed(() => new Intl.NumberFormat('fr-FR').format(props.value));

const colorMap = {
    green:  { bg: 'bg-green-100',  color: 'text-green-700' },
    yellow: { bg: 'bg-yellow-100', color: 'text-yellow-700' },
    teal:   { bg: 'bg-teal-100',   color: 'text-teal-700' },
    red:    { bg: 'bg-red-100',    color: 'text-red-700' },
    blue:   { bg: 'bg-blue-100',   color: 'text-blue-700' },
};

const iconBg    = computed(() => colorMap[props.color]?.bg    ?? 'bg-gray-100');
const iconColor = computed(() => colorMap[props.color]?.color ?? 'text-gray-700');

const iconPaths = {
    file:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
    clock:   '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    check:   '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    x:       '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    archive: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>',
};

const iconSvgPath = computed(() => iconPaths[props.icon] ?? iconPaths.file);
</script>
