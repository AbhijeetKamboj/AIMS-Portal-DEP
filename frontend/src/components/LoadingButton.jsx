export default function LoadingButton({ loading, children, ...props }) {
  return (
    <button
      disabled={loading}
      className={`w-full py-2 rounded text-white ${
        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
      }`}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
