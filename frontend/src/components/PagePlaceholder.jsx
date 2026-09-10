function PagePlaceholder({ title }) {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h1 className="text-3xl font-bold text-gray-800">
        {title}
      </h1>

      <p className="mt-4 text-gray-600">
        This page is under development.
      </p>
    </div>
  );
}

export default PagePlaceholder;