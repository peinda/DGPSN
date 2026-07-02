const colorMap = {
    green:  { bg: 'bg-green-100',  color: 'text-green-700' },
    yellow: { bg: 'bg-yellow-100', color: 'text-yellow-700' },
    teal:   { bg: 'bg-teal-100',   color: 'text-teal-700' },
    red:    { bg: 'bg-red-100',    color: 'text-red-700' },
    blue:   { bg: 'bg-blue-100',   color: 'text-blue-700' },
};

const iconPaths = {
    file:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
    clock:   '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    check:   '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    x:       '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    archive: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>',
};

export default function KpiCard({ label, value = 0, trend = 0, color = 'green', icon = 'file' }) {
    const formattedValue = new Intl.NumberFormat('fr-FR').format(value);
    const iconBg = colorMap[color]?.bg ?? 'bg-gray-100';
    const iconColor = colorMap[color]?.color ?? 'text-gray-700';
    const iconSvgPath = iconPaths[icon] ?? iconPaths.file;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-start gap-3">
            <div className={['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', iconBg].join(' ')}>
                <svg
                    className={['w-5 h-5', iconColor].join(' ')}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: iconSvgPath }}
                />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 leading-tight truncate">{label}</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">{formattedValue}</p>
                <div className="flex items-center gap-1 mt-0.5">
                    <svg className={['w-3 h-3', trend >= 0 ? 'text-green-500' : 'text-red-500'].join(' ')} fill="currentColor" viewBox="0 0 20 20">
                        {trend >= 0 ? (
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        ) : (
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        )}
                    </svg>
                    <span className={['text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-600'].join(' ')}>
                        {Math.abs(trend)}% ce mois
                    </span>
                </div>
            </div>
        </div>
    );
}
