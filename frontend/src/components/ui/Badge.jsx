function Badge({ children, variant = "success" }) {
  const baseClasses =
    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

  const variants = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </span>
  );
}

export default Badge;