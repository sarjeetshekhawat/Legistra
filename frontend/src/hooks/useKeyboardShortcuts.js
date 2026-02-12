import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for global keyboard shortcuts
 * @param {Function} toggleDarkMode - Function to toggle dark mode
 * @param {Function} showShortcutHelp - Function to show shortcut help modal
 */
const useKeyboardShortcuts = (toggleDarkMode, showShortcutHelp) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if user is typing in an input field
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
      
      // Ctrl/Cmd + U - Navigate to Upload
      if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
        event.preventDefault();
        navigate('/upload');
        return;
      }

      // Ctrl/Cmd + K - Focus search (if exists)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Ctrl/Cmd + D - Toggle dark mode
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        if (toggleDarkMode) {
          toggleDarkMode();
        }
        return;
      }

      // ? - Show keyboard shortcuts help (only when not in input field)
      if (event.key === '?' && !isInputField && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        if (showShortcutHelp) {
          showShortcutHelp();
        }
        return;
      }

      // Esc - Close modals (handled by individual components)
      if (event.key === 'Escape') {
        // This will be handled by modal components themselves
        return;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, toggleDarkMode, showShortcutHelp]);
};

export default useKeyboardShortcuts;
