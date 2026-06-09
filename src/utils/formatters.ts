export const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  try {
    return new Intl.DateTimeFormat('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date(dateStr));
  } catch { 
    return dateStr; 
  }
};

export const relativeTime = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) return 'hoy';
    if (daysDifference > -30 && daysDifference < 30) return rtf.format(daysDifference, 'day');
    return formatDate(dateStr);
  } catch {
    return '';
  }
};

export const daysBetween = (start: string, end?: string) => {
  const d1 = new Date(start);
  const d2 = end ? new Date(end) : new Date();
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};