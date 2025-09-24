import React from 'react';

// This component is no longer used in the Admin Dashboard.
// The new horizontal bar chart is implemented directly in the TeamPulse component
// in AdminHomeDashboard.tsx for better contextual styling.

interface BarChartData {
    label: string;
    value: number;
}

interface BarChartProps {
    data: BarChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 0);
    if (maxValue === 0) {
        return <p className="text-center text-slate-500 py-8">No data to display.</p>;
    }

    return (
        <div className="space-y-3">
            {data.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-16 truncate text-right">{item.label}</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-5">
                        <div 
                            className="bg-sky-500 h-5 rounded-full flex items-center justify-end px-2"
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        >
                           <span className="text-white text-xs font-bold">{item.value}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BarChart;
