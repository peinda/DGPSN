<template>
    <div>
        <button
            @click="toggle"
            :class="[
                'w-full flex items-center gap-3 py-2.5 pr-3 transition-colors duration-150',
                open ? 'pl-4' : 'pl-4 justify-center',
                'text-white/70 hover:bg-white/5 hover:text-white',
            ]"
        >
            <span class="shrink-0 w-5 h-5 flex items-center justify-center">
                <component :is="icons[icon]" class="w-5 h-5" />
            </span>
            <span v-show="open" class="text-sm truncate flex-1 text-left">{{ label }}</span>
            <svg
                v-show="open"
                class="w-4 h-4 shrink-0 transition-transform"
                :class="expanded ? 'rotate-180' : ''"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
        </button>

        <div v-show="expanded && open">
            <slot />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import FileTextIcon from './icons/FileTextIcon.vue';
import BookIcon from './icons/BookIcon.vue';
import ChartIcon from './icons/ChartIcon.vue';
import UserGroupIcon from './icons/UserGroupIcon.vue';

const props = defineProps({
    icon: String,
    label: String,
    open: Boolean,
});

const expanded = ref(false);
function toggle() {
    if (props.open) expanded.value = !expanded.value;
}

const icons = {
    'file-text': FileTextIcon,
    book: BookIcon,
    chart: ChartIcon,
    'user-group': UserGroupIcon,
};
</script>
