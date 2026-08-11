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
  const [isOpen, setIsOpen] = useState(false);
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

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-2">
      {/* Date Picker Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-left hover:bg-muted/50 transition flex items-center justify-between"
      >
        <span className="text-sm">
          {mode === 'range' && endDate
            ? `${formatDateDisplay(startDate)} → ${formatDateDisplay(endDate)}`
            : formatDateDisplay(startDate)}
        </span>
        <span className="text-muted-foreground">📅</span>
      </button>

      {/* Calendar Modal */}
      {isOpen && (
        <div className="border border-border rounded-lg p-4 bg-card space-y-3">
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
              Single
            </button>
            <button
              onClick={() => setMode('range')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${
                mode === 'range'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              Range
            </button>
          </div>

          {/* Calendar */}
          <div className="border border-border rounded-lg p-3 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-muted rounded transition text-sm"
              >
                ←
              </button>
              <h3 className="font-semibold text-foreground text-sm">{monthName}</h3>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-muted rounded transition text-sm"
              >
                →
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (day) {
                      handleDateClick(day);
                      if (mode === 'single') setIsOpen(false);
                    }
                  }}
                  disabled={!day}
                  className={`h-7 rounded text-xs font-medium transition ${
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

          {/* Time Input */}
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
      )}
    </div>
  );
}
