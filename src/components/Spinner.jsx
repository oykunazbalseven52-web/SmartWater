import "./Spinner.css";

export default function Spinner({ size = 24 }) {
  const borderWidth = Math.max(2, Math.round(size / 8));
  return (
    <span
      className="ui-spinner"
      style={{ width: size, height: size, borderWidth }}
      role="status"
      aria-label="Yükleniyor"
    />
  );
}
