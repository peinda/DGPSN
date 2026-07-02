import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function FlashMessage() {
    const { props } = usePage();
    const message = props.flash?.success || props.flash?.error || null;
    const isError = !!props.flash?.error;

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setVisible(!!message));
        return () => cancelAnimationFrame(raf);
    }, [message]);

    if (!message) return null;

    return (
        <div
            className={[
                'flex items-center gap-3 px-4 py-3 mb-5 rounded-lg border text-sm transition-all',
                isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800',
                visible ? 'duration-200 ease-out opacity-100 translate-y-0' : 'duration-150 ease-in opacity-0 -translate-y-2',
            ].join(' ')}
        >
            {isError ? (
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
            ) : (
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
            )}
            <span>{message}</span>
        </div>
    );
}
