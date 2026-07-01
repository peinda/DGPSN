<template>
    <div class="flex items-center gap-4">
        <!-- SVG Donut -->
        <div class="shrink-0 relative" style="width: 130px; height: 130px;">
            <svg viewBox="0 0 130 130" class="w-full h-full -rotate-90">
                <circle cx="65" cy="65" r="52" fill="none" stroke="#f3f4f6" stroke-width="20"/>
                <circle
                    v-for="(seg, i) in segments"
                    :key="i"
                    cx="65" cy="65" r="52"
                    fill="none"
                    :stroke="seg.color"
                    stroke-width="20"
                    :stroke-dasharray="`${seg.dash} ${circumference - seg.dash}`"
                    :stroke-dashoffset="-seg.offset"
                    stroke-linecap="butt"
                />
            </svg>
            <!-- Center text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-xl font-bold text-gray-900">{{ totalFormatted }}</span>
                <span class="text-[10px] text-gray-400">Total</span>
            </div>
        </div>

        <!-- Legend -->
        <div class="flex-1 space-y-2 min-w-0">
            <div
                v-for="item in data"
                :key="item.label"
                class="flex items-center justify-between gap-2"
            >
                <div class="flex items-center gap-1.5 min-w-0">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }"/>
                    <span class="text-xs text-gray-600 truncate">{{ item.label }}</span>
                </div>
                <span class="text-xs font-medium text-gray-700 shrink-0">
                    {{ pct(item.value) }}% ({{ item.value.toLocaleString('fr-FR') }})
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    data: { type: Array, default: () => [] },
});

const circumference = 2 * Math.PI * 52;

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0));
const totalFormatted = computed(() => new Intl.NumberFormat('fr-FR').format(total.value));

function pct(v) {
    return total.value ? Math.round((v / total.value) * 100) : 0;
}

const segments = computed(() => {
    if (!total.value) return [];
    let offset = 0;
    return props.data.map(d => {
        const dash = (d.value / total.value) * circumference;
        const seg = { dash, offset, color: d.color };
        offset += dash;
        return seg;
    });
});
</script>
