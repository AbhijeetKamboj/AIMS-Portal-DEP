export default function Textarea({
  label,
  error,
  helperText,
  fullWidth = true,
  style = {},
  ...props
}) {
  const textareaStyle = {
    padding: "var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    border: error ? "2px solid var(--error)" : "1px solid var(--gray-300)",
    width: fullWidth ? "100%" : "auto",
    fontSize: "1rem",
    fontFamily: "inherit",
    transition: "all var(--transition-fast)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    marginBottom: error || helperText ? "var(--spacing-xs)" : "var(--spacing-md)",
    resize: "vertical",
    minHeight: "100px",
    ...style,
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = error ? "var(--error)" : "var(--primary)";
    e.target.style.outline = "none";
    e.target.style.boxShadow = `0 0 0 3px ${error ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)"}`;
  };

  const handleBlur = (e) => {
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ width: fullWidth ? "100%" : "auto", marginBottom: "var(--spacing-md)" }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "var(--spacing-xs)",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: error ? "var(--error)" : "var(--text-primary)",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={textareaStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {error && (
        <p
          style={{
            color: "var(--error)",
            fontSize: "0.875rem",
            marginTop: "var(--spacing-xs)",
            marginBottom: 0,
          }}
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            marginTop: "var(--spacing-xs)",
            marginBottom: 0,
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
