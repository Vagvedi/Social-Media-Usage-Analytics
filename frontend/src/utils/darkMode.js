/**
 * Dark mode utilities
 * Manages dark mode state in localStorage and DOM
 */

export const initDarkMode = () => {
  const isDark = localStorage.getItem('darkMode') === 'true' ||
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return isDark;
};

export const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark.toString());
  return isDark;
};

export const setDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('darkMode', isDark.toString());
};
