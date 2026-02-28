import React, { useEffect } from 'react';

export const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: "🏥", patients: "👥", appointments: "📅", records: "📋",
    billing: "💳", reports: "📊", users: "⚙️", logout: "🚪",
    plus: "＋", edit: "✏️", trash: "🗑️", eye: "👁️", search: "🔍",
    check: "✓", x: "✕", close: "✕", bell: "🔔", menu: "☰",
    arrow_left: "←", arrow_right: "→", calendar: "📆", clock: "🕐",
    user: "👤", phone: "📞", email: "📧", location: "📍", heart: "❤️",
    pill: "💊", file: "📄", chart: "📈", money: "💰", warning: "⚠️",
    info: "ℹ️", star: "⭐", print: "🖨️", download: "⬇️", upload: "⬆️",
    save: "💾", refresh: "🔄", filter: "🔽", pdf: "📄", shield: "🔒",
    settings: "⚙️", doctor: "👨‍⚕️", stethoscope: "🩺"
  };
  return <span style={{ fontSize: size, lineHeight: 1 }}>{icons[name] || "•"}</span>;
};

export function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      <span>{type === "success" ? "✓" : "⚠"}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16 }}>✕</button>
    </div>
  );
}

export function Modal({ title, children, onClose, size = "", footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <UiverseButton className="btn-icon" onClick={onClose} text="✕"><Icon name="close" /></UiverseButton>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function UiverseButton({ text, children, className, ...props }) {
  const label = text || (typeof children === 'string' ? children : "");
  return (
    <button className={`button ${className || ""}`} data-text={label} {...props}>
      <span className="actual-text">&nbsp;{children || text}&nbsp;</span>
      <span aria-hidden="true" className="hover-text">&nbsp;{children || text}&nbsp;</span>
    </button>
  );
}