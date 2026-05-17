import React from 'react';

function Toast({ message, type = 'success', visible = false, onClose }) {
  React.useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <div className="toast" style={{
      borderLeft: type === 'success'
        ? '4px solid #007600'
        : type === 'error'
          ? '4px solid #b12704'
          : '4px solid #febd69'
    }}>
      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

Toast.defaultProps = {
  message: '',
  type: 'success',
  visible: false,
};

export default Toast;
