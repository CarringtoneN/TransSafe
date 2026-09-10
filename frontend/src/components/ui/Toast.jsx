function Toast({ message, type = "success", isVisible }) {
  if (!isVisible) return null;

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-500",
    info: "bg-blue-600",
  };

  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg`}
      >
        {message}
      </div>
    </div>
  );
}

export default Toast;