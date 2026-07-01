<template>
    <div class="relative" style="height: 200px;">
        <svg :viewBox="`0 0 ${width} ${height}`" class="w-full h-full" preserveAspectRatio="none">
            <!-- Grid lines -->
            <g>
                <line
                    v-for="(tick, i) in yTicks"
                    :key="i"
                    :x1="padding.left"
                    :x2="width - padding.right"
                    :y1="yScale(tick)"
                    :y2="yScale(tick)"
                    stroke="#f3f4f6"
                    stroke-width="1"
                />
            </g>

            <!-- Area fill -->
            <path
                :d="areaPath"
                fill="url(#greenGradient)"
                opacity="0.3"
            />

            <!-- Line -->
            <path
                :d="linePath"
                fill="none"
                stroke="#16a34a"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- Data points -->
            <circle
                v-for="(point, i) in points"
                :key="i"
                :cx="point.x"
                :cy="point.y"
                r="4"
                fill="white"
                stroke="#16a34a"
                stroke-width="2"
            />

            <!-- X labels -->
            <text
                v-for="(label, i) in data.labels"
                :key="label"
                :x="xScale(i)"
                :y="height - 4"
                text-anchor="middle"
                class="text-xs fill-gray-400"
                font-size="11"
                fill="#9ca3af"
            >
                {{ label }}
            </text>

            <!-- Y labels -->
            <text
                v-for="tick in yTicks"
                :key="tick"
                :x="padding.left - 6"
                :y="yScale(tick) + 4"
                text-anchor="end"
                font-size="11"
                fill="#9ca3af"
            >
                {{ tick }}
            </text>

            <!-- Gradient def -->
            <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#16a34a" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#16a34a" stop-opacity="0"/>
                </linearGradient>
            </defs>
        </svg>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => ({ labels: [], values: [] }),
    },
});

const width = 500;
const height = 200;
const padding = { top: 10, right: 10, bottom: 24, left: 36 };

const minVal = computed(() => {
    const vals = props.data.values;
    if (!vals?.length) return 0;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return min === max ? 0 : Math.max(0, min * 0.8);
});

const maxVal = computed(() => {
    const vals = props.data.values;
    if (!vals?.length) return 10;
    const max = Math.max(...vals);
    return max === 0 ? 10 : max * 1.1;
});

const yTicks = computed(() => {
    const range = maxVal.value - minVal.value;
    const rawStep = range / 4;
    // Arrondir au multiple de 50 supérieur, minimum 1 pour éviter boucle infinie
    const step = Math.max(1, Math.ceil(rawStep / 50) * 50);
    const ticks = [];
    for (let v = 0; v <= maxVal.value && ticks.length < 6; v += step) ticks.push(v);
    return ticks;
});

function xScale(i) {
    const count = (props.data.values?.length ?? 1) - 1;
    if (count === 0) return padding.left;
    return padding.left + (i / count) * (width - padding.left - padding.right);
}

function yScale(v) {
    const range = maxVal.value - minVal.value;
    if (range === 0) return height - padding.bottom;
    return padding.top + ((maxVal.value - v) / range) * (height - padding.top - padding.bottom);
}

const points = computed(() =>
    props.data.values.map((v, i) => ({ x: xScale(i), y: yScale(v) }))
);

const linePath = computed(() => {
    if (!points.value.length) return '';
    return points.value
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
        .join(' ');
});

const areaPath = computed(() => {
    if (!points.value.length) return '';
    const baseline = height - padding.bottom;
    const first = points.value[0];
    const last = points.value[points.value.length - 1];
    return `${linePath.value} L${last.x},${baseline} L${first.x},${baseline} Z`;
});
</script>
