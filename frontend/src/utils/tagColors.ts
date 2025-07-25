export const hashStringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  
  const positiveHash = Math.abs(hash);
  
  const stickerColors = [
    'bg-red-400 text-white border-red-500',
    'bg-blue-400 text-white border-blue-500', 
    'bg-green-400 text-white border-green-500',
    'bg-yellow-400 text-gray-800 border-yellow-500',
    'bg-purple-400 text-white border-purple-500',
    'bg-pink-400 text-white border-pink-500',
    'bg-indigo-400 text-white border-indigo-500',
    'bg-orange-400 text-white border-orange-500',
    'bg-teal-400 text-white border-teal-500',
    'bg-cyan-400 text-white border-cyan-500',
    'bg-lime-400 text-gray-800 border-lime-500',
    'bg-emerald-400 text-white border-emerald-500',
    'bg-violet-400 text-white border-violet-500',
    'bg-fuchsia-400 text-white border-fuchsia-500',
    'bg-rose-400 text-white border-rose-500',
    'bg-amber-400 text-gray-800 border-amber-500'
  ];
  
  return stickerColors[positiveHash % stickerColors.length];
};

export const getTagStickerClasses = (tagName: string): string => {
  const baseColor = hashStringToColor(tagName);
  return `${baseColor} rounded-full px-3 py-1 text-xs font-bold transform scale-95 hover:scale-100 transition-all duration-150 cursor-default border-2`;
};
