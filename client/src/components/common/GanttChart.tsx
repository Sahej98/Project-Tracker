import React, { useMemo } from 'react';
import type { Project } from '../../types';
import { ProjectStatus } from '../../types';

interface GanttChartProps {
  projects: Project[];
}

const GanttChart: React.FC<GanttChartProps> = ({ projects }) => {
  const { chartStartDate, chartEndDate, totalDays } = useMemo(() => {
    if (projects.length === 0) {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        chartStartDate: monthStart,
        chartEndDate: monthEnd,
        totalDays: 30,
      };
    }

    const startDates = projects.map((p) => new Date(p.startDate).getTime());
    const endDates = projects.map((p) => new Date(p.deadline).getTime());

    const minTime = Math.min(...startDates);
    const maxTime = Math.max(...endDates);

    const chartStartDate = new Date(minTime);
    chartStartDate.setDate(chartStartDate.getDate() - 5); // 5 days padding
    const chartEndDate = new Date(maxTime);
    chartEndDate.setDate(chartEndDate.getDate() + 5); // 5 days padding

    const totalDays = Math.round(
      (chartEndDate.getTime() - chartStartDate.getTime()) / (1000 * 3600 * 24)
    );

    return { chartStartDate, chartEndDate, totalDays };
  }, [projects]);

  const getDaysFromStart = (date: Date) => {
    return Math.round(
      (date.getTime() - chartStartDate.getTime()) / (1000 * 3600 * 24)
    );
  };

  const getMonthHeaders = () => {
    const months = [];
    let currentDate = new Date(chartStartDate);
    while (currentDate <= chartEndDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1);
    }
    return months;
  };

  const monthHeaders = getMonthHeaders();

  const statusColors: { [key in ProjectStatus]: string } = {
    [ProjectStatus.Completed]: 'bg-emerald-500',
    [ProjectStatus.InProgress]: 'bg-sky-500',
    [ProjectStatus.OnHold]: 'bg-amber-500',
    [ProjectStatus.NotStarted]: 'bg-slate-400',
  };

  return (
    <div className='p-4 overflow-x-auto'>
      <div className='min-w-[800px]'>
        {/* Header */}
        <div
          className='grid'
          style={{ gridTemplateColumns: `200px repeat(${totalDays}, 1fr)` }}>
          <div className='font-semibold text-sm p-2 border-b border-r border-slate-200'>
            Project
          </div>
          {monthHeaders.map((month, i) => {
            const startDay = getDaysFromStart(month);
            const nextMonth = new Date(month);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const endDay = getDaysFromStart(nextMonth);
            const monthSpan = endDay - startDay;

            return (
              <div
                key={i}
                className='text-center text-xs font-medium p-2 border-b border-slate-200'
                style={{ gridColumn: `${startDay + 2} / span ${monthSpan}` }}>
                {month.toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div
          className='relative grid'
          style={{ gridTemplateColumns: `200px repeat(${totalDays}, 1fr)` }}>
          {/* Grid lines */}
          {Array.from({ length: totalDays + 1 }).map((_, i) => (
            <div
              key={i}
              className='h-full border-r border-slate-100'
              style={{ gridColumn: i + 2, gridRow: '1 / -1' }}></div>
          ))}

          {projects.map((project, index) => {
            const projectStartDate = new Date(project.startDate);
            const projectEndDate = new Date(project.deadline);
            const startDay = getDaysFromStart(projectStartDate);
            const duration =
              Math.round(
                (projectEndDate.getTime() - projectStartDate.getTime()) /
                  (1000 * 3600 * 24)
              ) + 1;

            return (
              <React.Fragment key={project.id}>
                <div
                  className='text-sm p-2 border-r border-b border-slate-200 truncate'
                  style={{ gridRow: index + 1 }}>
                  {project.name}
                </div>
                <div
                  className='p-1 border-b border-slate-200'
                  style={{ gridColumn: '2 / -1', gridRow: index + 1 }}>
                  <div
                    className='relative h-6 rounded-md hover:opacity-80 transition-opacity'
                    style={{
                      marginLeft: `${(startDay / totalDays) * 100}%`,
                      width: `${(duration / totalDays) * 100}%`,
                    }}>
                    <div
                      className={`absolute inset-0 ${
                        statusColors[project.status]
                      } rounded-md`}></div>
                    <div
                      className={`absolute inset-0 bg-black/20 rounded-md`}
                      style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
