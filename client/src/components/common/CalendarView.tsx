import React, { useState } from 'react';
import type { Task } from '../../types';
import Card from './Card';
import { ChevronLeftIcon } from './Icons';

interface CalendarViewProps {
  tasks: (Task & { projectName?: string })[];
  onTaskClick: (task: Task & { projectName?: string }) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const tasksByDate = days.map((d) => ({
    date: d,
    tasks: tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      return taskDate.toDateString() === d.toDateString();
    }),
  }));

  const changeMonth = (amount: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  return (
    <Card>
      <div className='flex justify-between items-center mb-4'>
        <button
          onClick={() => changeMonth(-1)}
          className='p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary-rgb))]'>
          <ChevronLeftIcon className='w-5 h-5' />
        </button>
        <h3 className='text-xl font-bold text-[rgb(var(--text-primary-rgb))]'>
          {currentDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className='p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary-rgb))]'>
          <ChevronLeftIcon className='w-5 h-5 rotate-180' />
        </button>
      </div>
      <div className='grid grid-cols-7 gap-px bg-[rgb(var(--border-color-rgb))] border-t border-l border-[rgb(var(--border-color-rgb))]'>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className='text-center py-2 bg-[rgb(var(--bg-tertiary-rgb))] text-xs font-bold text-[rgb(var(--text-secondary-rgb))] uppercase'>
            {day}
          </div>
        ))}
        {tasksByDate.map(({ date, tasks: dayTasks }) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          return (
            <div
              key={date.toString()}
              className={`p-2 h-32 overflow-y-auto ${
                isCurrentMonth
                  ? 'bg-[rgb(var(--bg-secondary-rgb))]'
                  : 'bg-[rgb(var(--bg-tertiary-rgb))]'
              } border-r border-b border-[rgb(var(--border-color-rgb))]`}>
              <p
                className={`text-xs font-semibold ${
                  isToday
                    ? 'text-white bg-[rgb(var(--accent-primary-rgb))] rounded-full w-5 h-5 flex items-center justify-center'
                    : isCurrentMonth
                    ? 'text-[rgb(var(--text-primary-rgb))]'
                    : 'text-[rgb(var(--text-secondary-rgb))]'
                }`}>
                {date.getDate()}
              </p>
              <div className='space-y-1 mt-1'>
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className='text-xs p-1 bg-sky-500/10 text-sky-500 rounded-md truncate cursor-pointer hover:bg-sky-500/20'>
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CalendarView;
