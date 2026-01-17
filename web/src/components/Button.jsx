export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  style = {},
}) {
  const baseStyle = {
    border: "none",
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "500",
    transition: "all var(--transition-base)",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-sm)",
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? "100%" : "auto",
  };

  const variantStyles = {
    primary: {
      background: "var(--primary)",
      color: "white",
    },
    secondary: {
      background: "var(--gray-200)",
      color: "var(--text-primary)",
    },
    success: {
      background: "var(--success)",
      color: "white",
    },
    danger: {
      background: "var(--error)",
      color: "white",
    },
    outline: {
      background: "transparent",
      color: "var(--primary)",
      border: "2px solid var(--primary)",
    },
  };

  const sizeStyles = {
    sm: {
      padding: "var(--spacing-sm) var(--spacing-md)",
      fontSize: "0.875rem",
    },
    md: {
      padding: "var(--spacing-md) var(--spacing-lg)",
      fontSize: "1rem",
    },
    lg: {
      padding: "var(--spacing-lg) var(--spacing-xl)",
      fontSize: "1.125rem",
    },
  };

  const combinedStyle = {
    ...baseStyle,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      e.target.style.transform = "translateY(-1px)";
      e.target.style.boxShadow = "var(--shadow-md)";
      if (variant === "primary") {
        e.target.style.background = "var(--primary-dark)";
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.target.style.transform = "translateY(0)";
      e.target.style.boxShadow = "none";
      if (variant === "primary") {
        e.target.style.background = "var(--primary)";
      }
    }
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={combinedStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}
