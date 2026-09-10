function Card({ children, className = "" }) {
  return (
    <div
      className={`
        bg-white
        rounded-xl
        shadow-md
        border
        border-gray-200
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;