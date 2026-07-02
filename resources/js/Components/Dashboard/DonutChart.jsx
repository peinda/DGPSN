const circumference = 2 * Math.PI * 52;

export default function DonutChart({ data = [] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const totalFormatted = new Intl.NumberFormat('fr-FR').format(total);

    function pct(v) {
        return total ? Math.round((v / total) * 100) : 0;
    }

    let offset = 0;
    const segments = total
        ? data.map((d) => {
              const dash = (d.value / total) * circumference;
              const seg = { dash, offset, color: d.color };
              offset += dash;
              return seg;
          })
        : [];

    return (
        <div className="flex items-center gap-4">
            <div className="shrink-0 relative" style={{ width: '130px', height: '130px' }}>
                <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
                    <circle cx="65" cy="65" r="52" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                    {segments.map((seg, i) => (
                        <circle
                            key={i}
                            cx="65" cy="65" r="52"
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="20"
                            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                            strokeDashoffset={-seg.offset}
                            strokeLinecap="butt"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{totalFormatted}</span>
                    <span className="text-[10px] text-gray-400">Total</span>
                </div>
            </div>

            <div className="flex-1 space-y-2 min-w-0">
                {data.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-gray-600 truncate">{item.label}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-700 shrink-0">
                            {pct(item.value)}% ({item.value.toLocaleString('fr-FR')})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
