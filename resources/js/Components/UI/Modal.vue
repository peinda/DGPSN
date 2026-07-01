<template>
    <Teleport to="body">
        <Transition enter-active-class="duration-150 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
                    leave-active-class="duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />
                <div class="relative bg-white rounded-xl shadow-xl w-full overflow-hidden" :class="sizeClass">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
                        <button @click="$emit('close')" class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <div class="px-6 py-5 max-h-[72vh] overflow-y-auto">
                        <slot />
                    </div>
                    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <slot name="footer" />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    show:    { type: Boolean, default: false },
    title:   { type: String,  default: '' },
    size:    { type: String,  default: 'md' },
});
defineEmits(['close']);

const sizeClass = computed(() => ({
    sm:  'max-w-sm',
    md:  'max-w-md',
    lg:  'max-w-lg',
    xl:  'max-w-xl',
    '2xl': 'max-w-2xl',
}[props.size] ?? 'max-w-md'));
</script>
