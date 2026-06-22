import React, { useMemo } from 'react';
import { Course } from '../types';

interface ScheduleProps {
  courses: Course[];
}

const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const Schedule: React.FC<ScheduleProps> = ({ courses }) => {
  const startHour = 8;
  const endHour = 21;
  const hoursPerDay = endHour - startHour;
  const slotHeight = 60; // px per hour

  // Build schedule events with pixel positions
  const events = useMemo(() => {
    const items: {
      course: Course;
      dayIndex: number;
      top: number;
      height: number;
      room: string;
      day: string;
    }[] = [];

    courses.forEach(course => {
      course.schedule.forEach(s => {
        const dayIndex = DAYS.indexOf(s.day);
        if (dayIndex === -1) return;
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        const startMin = (sh - startHour) * 60 + sm;
        const endMin = (eh - startHour) * 60 + em;
        const duration = endMin - startMin;
        items.push({
          course,
          dayIndex,
          top: (startMin / 60) * slotHeight,
          height: (duration / 60) * slotHeight,
          room: s.room,
          day: s.day,
        });
      });
    });

    return items;
  }, [courses]);

  const timeLabels = useMemo(() => {
    const labels = [];
    for (let h = startHour; h < endHour; h++) {
      labels.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return labels;
  }, []);

  // Simple summary cards
  const courseSummary = useMemo(() => {
    return courses.map(c => ({
      course: c,
      schedule: c.schedule,
    }));
  }, [courses]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">جدول المحاضرات الأسبوعي</h2>
        <p className="text-slate-500">عرض الجدول الزمني لجميع الكورسات</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {courses.map(course => (
          <div key={course.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: course.color }} />
            <span className="text-sm text-slate-600 font-medium">{course.name}</span>
          </div>
        ))}
      </div>

      {/* Schedule Grid - CSS Grid Based */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] bg-slate-50 border-b border-slate-200">
              <div className="p-3 text-right text-sm font-semibold text-slate-600 border-l border-slate-200">الوقت</div>
              {DAYS.map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600">{day}</div>
              ))}
            </div>

            {/* Grid body */}
            <div className="relative grid grid-cols-[100px_repeat(7,1fr)]">
              {/* Time column background */}
              <div className="relative border-l border-slate-200 bg-slate-50/50" style={{ height: hoursPerDay * slotHeight }}>
                {timeLabels.map((t, i) => (
                  <div key={t} className="absolute right-0 left-0 text-xs text-slate-500 px-2 text-right" style={{ top: i * slotHeight - 6 }} dir="ltr">
                    {t}
                  </div>
                ))}
                {/* Horizontal lines */}
                {timeLabels.map((_, i) => (
                  <div key={i} className="absolute right-0 left-0 border-t border-slate-100" style={{ top: i * slotHeight }} />
                ))}
              </div>

              {/* Day columns */}
              {DAYS.map((_, dayIdx) => (
                <div key={dayIdx} className="relative border-l border-slate-200" style={{ height: hoursPerDay * slotHeight }}>
                  {/* Hour grid lines */}
                  {timeLabels.map((_, i) => (
                    <div key={i} className="absolute right-0 left-0 border-t border-slate-100" style={{ top: i * slotHeight }} />
                  ))}
                  {/* Events */}
                  {events
                    .filter(e => e.dayIndex === dayIdx)
                    .map((ev, i) => (
                      <div
                        key={`${ev.course.id}-${i}`}
                        className="absolute right-1 left-1 rounded-xl p-2 text-white overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col justify-between z-10"
                        style={{
                          top: ev.top + 2,
                          height: ev.height - 4,
                          backgroundColor: ev.course.color,
                        }}
                      >
                        {ev.height >= 40 ? (
                          <>
                            <p className="text-xs font-bold leading-tight line-clamp-2">{ev.course.name}</p>
                            {ev.height >= 55 && (
                              <>
                                <p className="text-[10px] opacity-90">{ev.room}</p>
                                <p className="text-[10px] opacity-75" dir="ltr">
                                  {ev.course.schedule.find(s => s.day === ev.day)?.startTime} - {ev.course.schedule.find(s => s.day === ev.day)?.endTime}
                                </p>
                              </>
                            )}
                          </>
                        ) : (
                          <p className="text-[10px] font-bold truncate">{ev.course.name}</p>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {courseSummary.map(({ course, schedule }) => (
          <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
              <h4 className="font-bold text-slate-700 text-sm line-clamp-2">{course.name}</h4>
            </div>
            <div className="space-y-2">
              {schedule.map((s, i) => (
                <div key={i} className="flex justify-between text-xs bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500">{s.day}</span>
                  <span className="text-slate-700 font-medium" dir="ltr">{s.startTime} - {s.endTime}</span>
                  <span className="text-slate-400">{s.room}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
