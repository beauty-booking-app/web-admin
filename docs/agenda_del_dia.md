import { Clock, User, Phone, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG, CATEGORY_CONFIG, getCurrentMinutes, parseTimeToMinutes } from '@/lib/salonData';
import StatusBadge from './StatusBadge';

export default function TodayTimeline({ appointments, onStatusChange }) {
  const now = getCurrentMinutes();
  const sorted = [...appointments].sort(
    (a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time)
  );

  if (!sorted.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">La agenda del día está vacía.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[88px] top-2 bottom-2 w-px bg-border hidden sm:block" />

      <div className="space-y-2.5">
        {sorted.map(apt => {
          const start = parseTimeToMinutes(apt.start_time);
          const isPast = apt.status === 'completado' || apt.status === 'cancelado';
          const isNow = apt.status === 'en_proceso';
          const cat = CATEGORY_CONFIG[apt.service_category] || {};
          const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pendiente;
          const isCurrent = !isPast && start <= now + 5;

          return (
            <div
              key={apt.id}
              className={cn(
                'relative flex gap-3 sm:gap-4 rounded-xl border bg-card p-3 transition-opacity',
                isPast ? 'opacity-55' : '',
                isNow ? 'border-amber-300 shadow-sm' : 'border-border'
              )}
            >
              {/* Time column */}
              <div className="w-16 sm:w-[68px] shrink-0 text-right pt-1">
                <p className="text-sm font-semibold tabular-nums">{apt.start_time}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums">{apt.end_time}</p>
              </div>

              {/* Dot */}
              <div className="hidden sm:flex items-start pt-2">
                <span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full ring-4 ring-card',
                    isNow ? 'animate-pulse' : '',
                    cfg.bar
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium', cat.bg, cat.color)}>
                    {cat.label}
                  </span>
                  <StatusBadge status={apt.status} />
                </div>
                <p className="font-heading font-semibold text-[15px] leading-tight">{apt.service_name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {apt.client_name}
                  </span>
                  {apt.employee_name && <span>· {apt.employee_name}</span>}
                  {apt.client_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {apt.client_phone}
                    </span>
                  )}
                  {apt.price != null && (
                    <span className="font-medium text-foreground tabular-nums">${apt.price.toLocaleString('es-AR')}</span>
                  )}
                </div>
                {apt.notes && (
                  <p className="flex items-start gap-1 text-[11px] text-muted-foreground mt-1.5 italic">
                    <StickyNote className="w-3 h-3 mt-0.5 shrink-0" /> {apt.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              {!isPast && onStatusChange && (
                <div className="flex flex-col gap-1.5 shrink-0">
                  {apt.status === 'pendiente' && (
                    <button
                      onClick={() => onStatusChange(apt, 'confirmado')}
                      className="text-[11px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium whitespace-nowrap"
                    >
                      Confirmar
                    </button>
                  )}
                  {apt.status === 'confirmado' && (
                    <button
                      onClick={() => onStatusChange(apt, 'en_proceso')}
                      className="text-[11px] px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium whitespace-nowrap"
                    >
                      Iniciar
                    </button>
                  )}
                  {apt.status === 'en_proceso' && (
                    <button
                      onClick={() => onStatusChange(apt, 'completado')}
                      className="text-[11px] px-2 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors font-medium whitespace-nowrap"
                    >
                      Completar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}