import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
};

export default function Modal({ show = false, title = '', size = 'md', onClose, children, footer }) {
    const [mounted, setMounted] = useState(show);
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        if (show) {
            setMounted(true);
            const raf = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(raf);
        }
        setVisible(false);
        const timeout = setTimeout(() => setMounted(false), 100);
        return () => clearTimeout(timeout);
    }, [show]);

    if (!mounted) return null;

    const sizeClass = sizeClasses[size] ?? 'max-w-md';

    return createPortal(
        <div
            className={[
                'fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity',
                visible ? 'duration-150 ease-out opacity-100' : 'duration-100 ease-in opacity-0',
            ].join(' ')}
        >
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className={['relative bg-white rounded-xl shadow-xl w-full overflow-hidden', sizeClass].join(' ')}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-5 max-h-[72vh] overflow-y-auto">
                    {children}
                </div>
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
