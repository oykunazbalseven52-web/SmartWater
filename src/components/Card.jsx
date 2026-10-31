import "./Card.css";

export default function Card({ title, children, className = "" }) {
  return (
    <section className={`ui-card ${className}`.trim()}>
      {title && <h2 className="ui-card__title">{title}</h2>}
      {children}
    </section>
  );
}
