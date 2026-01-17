export default function Card({ children, onClick, style = {} }) {
  const cardStyle = {
    background: "var(--bg-secondary)",
    padding: "var(--spacing-lg)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
    marginBottom: "var(--spacing-md)",
    transition: "all var(--transition-base)",
    cursor: onClick ? "pointer" : "default",
    border: "1px solid var(--gray-200)",
    ...style,
  };

  const handleMouseEnter = (e) => {
    if (onClick) {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "var(--shadow-lg)";
    }
  };

  const handleMouseLeave = (e) => {
    if (onClick) {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "var(--shadow-md)";
    }
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
