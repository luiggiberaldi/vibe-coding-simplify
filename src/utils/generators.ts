export const generateId = () => crypto.randomUUID();

export const getColorForId = (id: string) => {
  const colors = ['#f85149', '#3fb950', '#58a6ff', '#d29922', '#bc8cff', '#db6d28'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const getInitials = (name?: string) => {
  if (!name) return '';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
};