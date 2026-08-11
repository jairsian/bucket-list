'use client';

import { useState } from 'react';

interface DatePickerProps {
  startDate: string;
  endDate: string;
  startTime: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  showTime?: boolean;
}

export function DatePicker({
  startDate,
  endDate,
  startTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  showTime = true,
}: DatePickerProps) {
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = selected.toISOString().split('T')[0];

    if (mode === 'single') {
      onStartDateChange(dateString);
      onEndDateChange('');
    } else {
      if (!startDate || (startDate && endDate)) {
        onStartDateChange(dateString);
        onEndDateChange('');
      } else if (dateString >= startDate) {
        onEndDateChange(dateString);
      } else {
        onStartDateChange(dateString);
        onEndDateChange(startDate);
      }
    }
  };

  const days = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const isDateInRange = (day: number | null) => {
    if (!day || !startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return dateString >= startDate && dateString <= endDate;
  };

  const isStartOrEndDate = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return dateString === startDate || dateString === endDate;
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('single')}
          className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${
            mode === 'single'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          Single Date
        </button>
        <button
          onClick={() => setMode('range')}
          className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${
            mode === 'range'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          Date Range
        </button>
      </div>

      {/* Calendar */}
      <div className="border border-border rounded-lg p-4 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-muted rounded transition"
          >
            ←
          </button>
          <h3 className="font-semibold text-foreground">{monthName}</h3>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-muted rounded transition"
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => day && handleDateClick(day)}
              disabled={!day}
              className={`aspect-square rounded text-sm font-medium transition ${
                !day
                  ? 'opacity-0 cursor-default'
                  : isStartOrEndDate(day)
                  ? 'bg-primary text-primary-foreground'
                  : isDateInRange(day)
                  ? 'bg-primary/20 text-foreground'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Dates Display */}
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {mode === 'range' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">End Date (optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {showTime && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Start Time (optional)</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
