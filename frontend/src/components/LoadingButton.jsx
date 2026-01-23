export default function LoadingButton({ loading, onClick, children, className = "", variant = "primary", ...props }) {
  const baseClasses = "btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    danger: "btn-danger",
    success: "btn-success"
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
