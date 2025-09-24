import React, { useState, useMemo } from 'react';

interface DataPoint {
    date: string;
    value: number; // in minutes
}

interface LineChartProps {
    data: DataPoint[];
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; data: DataPoint } | null>(null);
    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const { xScale, yScale, linePath, areaPath, points } = useMemo(() => {
        if (data.length < 2) return { xScale: null, yScale: null, linePath: '', areaPath: '', points: [] };
        
        const dates = data.map(d => new Date(d.date));
        const values = data.map(d => d.value);

        const minDate = Math.min(...dates.map(d => d.getTime()));
        const maxDate = Math.max(...dates.map(d => d.getTime()));
        const maxValue = Math.max(...values, 0);

        const xScale = (date: Date) => margin.left + ((date.getTime() - minDate) / (maxDate - minDate)) * innerWidth;
        const yScale = (value: number) => margin.top + innerHeight - (value / (maxValue || 1)) * innerHeight;

        const lineGenerator = (d: DataPoint) => `${xScale(new Date(d.date))},${yScale(d.value)}`;
        const linePath = `M ${lineGenerator(data[0])} ` + data.slice(1).map((d, i) => {
            const prev = data[i];
            const x1 = xScale(new Date(prev.date));
            const y1 = yScale(prev.value);
            const x2 = xScale(new Date(d.date));
            const y2 = yScale(d.value);
            const cx = x1 + (x2-x1)/2;
            return `C ${cx},${y1} ${cx},${y2} ${x2},${y2}`;
        }).join(' ');

        const areaPath = `${linePath} L ${xScale(new Date(data[data.length-1].date))},${innerHeight + margin.top} L ${xScale(new Date(data[0].date))},${innerHeight + margin.top} Z`;

        const points = data.map(d => ({
            x: xScale(new Date(d.date)),
            y: yScale(d.value),
            data: d
        }));

        return { xScale, yScale, linePath, areaPath, points };
    }, [data, innerHeight, innerWidth, margin]);

    if (data.length < 2) return <div className="text-center py-10 text-[rgb(var(--text-secondary-rgb))]">Not enough data for time tracking chart.</div>;

    const yAxisValues = Array.from({length: 4}, (_, i) => Math.round(i * Math.max(...data.map(d => d.value))/3));

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full text-[rgb(var(--text-secondary-rgb))]">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(var(--accent-primary-rgb))" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="rgb(var(--accent-primary-rgb))" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                {/* Y-Axis */}
                <g className="text-xs" fill="currentColor">
                    {yScale && yAxisValues.map((val, i) => (
                         <g key={i}>
                            <text x={margin.left - 10} y={yScale(val)} dy="0.32em" textAnchor="end">{`${Math.floor(val/60)}h`}</text>
                            <line x1={margin.left} x2={width - margin.right} y1={yScale(val)} y2={yScale(val)} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="2,2" />
                        </g>
                    ))}
                </g>

                {/* X-Axis */}
                <g className="text-xs" fill="currentColor">
                    {xScale && [data[0], data[data.length-1]].map((d, i) => (
                        d && <text key={i} x={xScale(new Date(d.date))} y={height - margin.bottom + 20} textAnchor="middle">{new Date(d.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</text>
                    ))}
                </g>

                {/* Area */}
                <path d={areaPath} fill="url(#areaGradient)" />

                {/* Line */}
                <path d={linePath} fill="none" stroke="rgb(var(--accent-primary-rgb))" strokeWidth="2" />

                {/* Interactive layer */}
                <rect 
                    x={margin.left} y={margin.top} width={innerWidth} height={innerHeight}
                    fill="transparent"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const closestPoint = points.reduce((prev, curr) => 
                            Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
                        );
                        setTooltip(closestPoint);
                    }}
                    onMouseLeave={() => setTooltip(null)}
                />

                {/* Tooltip Indicator */}
                {tooltip && (
                    <g>
                        <line x1={tooltip.x} y1={margin.top} x2={tooltip.x} y2={innerHeight+margin.top} stroke="rgb(var(--accent-primary-rgb))" strokeDasharray="3,3" />
                        <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="rgb(var(--accent-primary-rgb))" stroke="rgb(var(--bg-secondary-rgb))" strokeWidth="2" />
                    </g>
                )}
            </svg>

            {tooltip && (
                <div 
                    className="absolute bg-[rgb(var(--bg-secondary-rgb))] text-[rgb(var(--text-primary-rgb))] text-xs rounded-lg p-2 shadow-lg pointer-events-none transition-opacity border border-[rgb(var(--border-color-rgb))]"
                    style={{ left: tooltip.x, top: tooltip.y - 60, transform: 'translateX(-50%)' }}
                >
                    <p className="font-bold text-center">{new Date(tooltip.data.date).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</p>
                    <p className="text-center text-lg font-bold text-[rgb(var(--accent-primary-rgb))]">{`${Math.floor(tooltip.data.value / 60)}h ${tooltip.data.value % 60}m`}</p>
                </div>
            )}
        </div>
    );
};

export default LineChart;