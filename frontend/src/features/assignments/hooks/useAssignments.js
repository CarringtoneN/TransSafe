import { useEffect, useMemo, useState } from "react";

import assignmentService from "../../../services/assignmentService";

export default function useAssignments() {

  const [assignments, setAssignments] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function loadAssignments() {

    try {

      setLoading(true);

      setError("");

      const data =
        await assignmentService.getAllAssignments();

      setAssignments(data);

    } catch (err) {

      console.error(err);

      setError("Failed to load assignments.");

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadAssignments();

  }, []);

  const filteredAssignments = useMemo(() => {

    if (!search) return assignments;

    const term = search.toLowerCase();

    return assignments.filter((assignment) => {

      return (

        assignment.driver.firstName
          .toLowerCase()
          .includes(term) ||

        assignment.driver.lastName
          .toLowerCase()
          .includes(term) ||

        assignment.vehicle.registration
          .toLowerCase()
          .includes(term) ||

        assignment.status
          .toLowerCase()
          .includes(term)

      );

    });

  }, [assignments, search]);

  return {

    assignments,

    filteredAssignments,

    search,

    setSearch,

    loading,

    error,

    loadAssignments,

  };

}