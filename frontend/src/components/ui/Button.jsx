function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
}) {
  const baseClasses =
    "px-4 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700",

    success:
      "bg-green-600 text-white hover:bg-green-700",

    warning:
      "bg-yellow-500 text-white hover:bg-yellow-600",

    danger:
      "bg-red-600 text-white hover:bg-red-700",

    secondary:
      "bg-gray-500 text-white hover:bg-gray-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export default Button;