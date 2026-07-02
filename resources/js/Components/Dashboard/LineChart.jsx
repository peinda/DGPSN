const width = 500;
const height = 200;
const padding = { top: 10, right: 10, bottom: 24, left: 36 };

export default function LineChart({ data = { labels: [], values: [] } }) {
    const vals = data.values ?? [];

    const minVal = (() => {
        if (!vals.length) return 0;
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        return min === max ? 0 : Math.max(0, min * 0.8);
    })();

    const maxVal = (() => {
        if (!vals.length) return 10;
        const max = Math.max(...vals);
        return max === 0 ? 10 : max * 1.1;
    })();

    const yTicks = (() => {
        const range = maxVal - minVal;
        const rawStep = range / 4;
        const step = Math.max(1, Math.ceil(rawStep / 50) * 50);
        const ticks = [];
        for (let v = 0; v <= maxVal && ticks.length < 6; v += step) ticks.push(v);
        return ticks;
    })();

    function xScale(i) {
        const count = (vals.length ?? 1) - 1;
        if (count === 0) return padding.left;
        return padding.left + (i / count) * (width - padding.left - padding.right);
    }

    function yScale(v) {
        const range = maxVal - minVal;
        if (range === 0) return height - padding.bottom;
        return padding.top + ((maxVal - v) / range) * (height - padding.top - padding.bottom);
    }

    const points = vals.map((v, i) => ({ x: xScale(i), y: yScale(v) }));

    const linePath = points.length
        ? points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
        : '';

    const areaPath = (() => {
        if (!points.length) return '';
        const baseline = height - padding.bottom;
        const first = points[0];
        const last = points[points.length - 1];
        return `${linePath} L${last.x},${baseline} L${first.x},${baseline} Z`;
    })();

    return (
        <div className="relative" style={{ height: '200px' }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                <g>
                    {yTicks.map((tick, i) => (
                        <line
                            key={i}
                            x1={padding.left}
                            x2={width - padding.right}
                            y1={yScale(tick)}
                            y2={yScale(tick)}
                            stroke="#f3f4f6"
                            strokeWidth="1"
                        />
                    ))}
                </g>

                <path d={areaPath} fill="url(#greenGradient)" opacity="0.3" />

                <path
                    d={linePath}
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {points.map((point, i) => (
                    <circle key={i} cx={point.x} cy={point.y} r="4" fill="white" stroke="#16a34a" strokeWidth="2" />
                ))}

                {(data.labels ?? []).map((label, i) => (
                    <text
                        key={label}
                        x={xScale(i)}
                        y={height - 4}
                        textAnchor="middle"
                        className="text-xs fill-gray-400"
                        fontSize="11"
                        fill="#9ca3af"
                    >
                        {label}
                    </text>
                ))}

                {yTicks.map((tick) => (
                    <text
                        key={tick}
                        x={padding.left - 6}
                        y={yScale(tick) + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="#9ca3af"
                    >
                        {tick}
                    </text>
                ))}

                <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
