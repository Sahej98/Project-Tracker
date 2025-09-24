import React, { useState } from 'react';

interface DataPoint {
    label: string;
    value: number;
}

interface WeeklyBarChartProps {
    data: DataPoint[];
}

const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const yScale = (value: number) => margin.top + innerHeight - (value / (maxValue || 1)) * innerHeight;
    const barWidth = data.length > 0 ? innerWidth / data.length * 0.6 : 0;
    const barGap = data.length > 0 ? innerWidth / data.length * 0.4 : 0;
    
    if (data.length === 0) return <div className="text-center py-10 text-[rgb(var(--text-secondary-rgb))]">No task completion data available.</div>;

    const yAxisLabels = [0, Math.ceil(maxValue/2), maxValue].filter((v, i, a) => a.indexOf(v) === i); // Unique values
    
    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full text-[rgb(var(--text-secondary-rgb))]">
                {/* Y-Axis */}
                <g className="text-xs" fill="currentColor">
                    {yAxisLabels.map((val, i) => (
                        <g key={i}>
                            <text x={margin.left - 10} y={yScale(val)} dy="0.32em" textAnchor="end">{val}</text>
                            <line x1={margin.left} x2={width - margin.right} y1={yScale(val)} y2={yScale(val)} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="2,2" />
                        </g>
                    ))}
                </g>

                {/* Bars and X-Axis Labels */}
                {data.map((d, i) => {
                    const x = margin.left + i * (barWidth + barGap) + barGap / 2;
                    const y = yScale(d.value);
                    const barHeight = innerHeight - (y - margin.top);
                    return (
                        <g key={d.label}>
                             <rect 
                                x={x} y={y} width={barWidth} height={barHeight}
                                fill="rgb(var(--accent-primary-rgb))"
                                rx="4"
                                className="transition-opacity duration-200"
                                opacity={activeIndex === null || activeIndex === i ? 1 : 0.5}
                                onMouseEnter={() => setActiveIndex(i)}
                                onMouseLeave={() => setActiveIndex(null)}
                            />
                            <text 
                                x={x + barWidth / 2}
                                y={height - margin.bottom + 15}
                                textAnchor="middle"
                                className="text-xs font-medium"
                                fill="currentColor"
                            >
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
             {activeIndex !== null && (
                <div 
                    className="absolute bg-[rgb(var(--bg-secondary-rgb))] text-[rgb(var(--text-primary-rgb))] text-xs rounded-lg p-2 shadow-lg pointer-events-none border border-[rgb(var(--border-color-rgb))]"
                    style={{ 
                        left: margin.left + activeIndex * (barWidth + barGap) + barGap/2 + barWidth/2,
                        top: yScale(data[activeIndex].value) - 40,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <p className="font-bold text-center">{data[activeIndex].label}</p>
                    <p className="text-center text-lg font-bold text-[rgb(var(--accent-primary-rgb))]">{data[activeIndex].value} tasks</p>
                </div>
            )}
        </div>
    );
};

export default WeeklyBarChart;