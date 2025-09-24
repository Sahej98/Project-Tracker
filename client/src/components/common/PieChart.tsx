import React from 'react';

interface PieChartData {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <p className="text-center text-[rgb(var(--text-secondary-rgb))] py-8">No data to display.</p>;
    }

    let cumulative = 0;

    return (
        <div className="flex flex-col items-center gap-6">
            <svg viewBox="0 0 36 36" className="w-40 h-40">
                {data.map((item, index) => {
                    const percentage = (item.value / total) * 100;
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const strokeDashoffset = -cumulative;
                    cumulative += percentage;

                    return (
                        <circle
                            key={index}
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="3"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 18 18)"
                        />
                    );
                })}
            </svg>
            <div className="w-full space-y-2">
                {data.map((item) => (
                    <div key={item.label} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span className="text-[rgb(var(--text-secondary-rgb))]">{item.label}</span>
                        </div>
                        <span className="font-semibold text-[rgb(var(--text-primary-rgb))]">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;