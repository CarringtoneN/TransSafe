import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import useAssignments from "../../features/assignments/hooks/useAssignments";

import AssignmentTable from "../../features/assignments/components/AssignmentTable";
import AssignmentModal from "../../features/assignments/components/AssignmentModal";
import ViewAssignmentModal from "../../features/assignments/components/ViewAssignmentModal";

import assignmentService from "../../services/assignmentService";
import driverService from "../../services/driverService";
import vehicleService from "../../services/vehicleService";

function Assignments() {

  const {
    filteredAssignments,
    search,
    setSearch,
    loading,
    error,
    loadAssignments,
  } = useAssignments();

  const [drivers,setDrivers]=useState([]);
  const [vehicles,setVehicles]=useState([]);

  const [editingAssignment,setEditingAssignment]=useState(null);
  const [selectedAssignment,setSelectedAssignment]=useState(null);

  const [isModalOpen,setIsModalOpen]=useState(false);
  const [isViewModalOpen,setIsViewModalOpen]=useState(false);

  useEffect(()=>{
    loadDrivers();
    loadVehicles();
  },[]);

  async function loadDrivers(){
    setDrivers(await driverService.getAllDrivers());
  }

  async function loadVehicles(){
    setVehicles(await vehicleService.getAllVehicles());
  }

  function openAddModal(){
    setEditingAssignment(null);
    setIsModalOpen(true);
  }

  function openEditModal(a){
    setEditingAssignment(a);
    setIsModalOpen(true);
  }

  function closeModal(){
    setEditingAssignment(null);
    setIsModalOpen(false);
  }

  function openViewModal(a){
    setSelectedAssignment(a);
    setIsViewModalOpen(true);
  }

  function closeViewModal(){
    setSelectedAssignment(null);
    setIsViewModalOpen(false);
  }

  async function saveAssignment(data){

    try{

      if(editingAssignment){

        await assignmentService.updateAssignment(
          editingAssignment.id,
          data
        );

      }else{

        await assignmentService.createAssignment(data);

      }

      await loadAssignments();

      closeModal();

    }catch(err){

      console.error(err);

      alert(
        err.response?.data?.message ||
        err.message
      );

    }

  }

  async function deleteAssignment(id){

    if(!window.confirm("Delete assignment?")) return;

    await assignmentService.deleteAssignment(id);

    await loadAssignments();

  }

  if(loading){

    return <div className="p-6">
      Loading assignments...
    </div>

  }

  return(

<div className="space-y-6">

<div className="flex items-center justify-between">

<div>

<h1 className="text-3xl font-bold text-slate-800">
Driver Assignments
</h1>

<p className="mt-2 text-gray-500">
Assign drivers to vehicles.
</p>

</div>

<button
onClick={openAddModal}
className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white"
>

<Plus size={18}/>

Assign Driver

</button>

</div>

<div className="flex justify-end">

<input
type="text"
placeholder="Search..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-72 rounded-lg border px-4 py-2"
/>

</div>

{error &&(

<div className="rounded-lg bg-red-100 p-4 text-red-700">

{error}

</div>

)}

<AssignmentTable

assignments={filteredAssignments}

onView={openViewModal}

onEdit={openEditModal}

onDelete={deleteAssignment}

/>

<AssignmentModal

isOpen={isModalOpen}

assignment={editingAssignment}

drivers={drivers}

vehicles={vehicles}

onSave={saveAssignment}

onClose={closeModal}

/>

<ViewAssignmentModal

isOpen={isViewModalOpen}

assignment={selectedAssignment}

onClose={closeViewModal}

/>

</div>

  );

}

export default Assignments;