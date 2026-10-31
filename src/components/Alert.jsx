import "./Alert.css";

export default function Alert({ type = "info", title, children, action }) {
  const role = type === "error" || type === "warning" ? "alert" : "status";
  return (
    <div className={`ui-alert ui-alert--${type}`} role={role}>
      {title && <p className="ui-alert__title">{title}</p>}
      {children && <div className="ui-alert__body">{children}</div>}
      {action && <div className="ui-alert__action">{action}</div>}
    </div>
  );
}
