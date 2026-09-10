export default function AssignmentList(props) {
  console.log("AssignmentList props:", props);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold">
        Assignment Page Works 🎉
      </h1>

      <pre>
        {JSON.stringify(props, null, 2)}
      </pre>
    </div>
  );
}