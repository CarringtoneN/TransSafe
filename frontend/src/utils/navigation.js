import { LayoutDashboard, Truck, Users, Wrench, ClipboardList, BarChart3, Bot, Settings, LogOut, UserCog } from "lucide-react";
const navigation = [
 {title:"Dashboard",path:"/",icon:LayoutDashboard},
 {title:"Fleet Management",icon:Truck,children:[{title:"Vehicles",path:"/vehicles"},{title:"Fleet Assets",path:"/fleet-assets"},{title:"Fuel Records",path:"/fuel-records"},{title:"Documents",path:"/documents"}]},
 {title:"Driver Management",icon:Users,children:[{title:"Drivers",path:"/drivers"},{title:"Assignments",path:"/assignments"},{title:"Shifts",path:"/shifts"},{title:"Pre-Trip Vehicle Inspection",path:"/inspections"},{title:"Incident Reports",path:"/incidents"}]},
 {title:"Maintenance",icon:Wrench,children:[{title:"Maintenance Schedule",path:"/maintenance-schedule"},{title:"Work Orders",path:"/work-orders"},{title:"Repairs",path:"/repairs"},{title:"Service History",path:"/service-history"},{title:"Compliance",path:"/compliance"}]},
 {title:"Operations",icon:ClipboardList,children:[{title:"Trips",path:"/trips"},{title:"Vehicle Allocation",path:"/vehicle-allocation"},{title:"Driver Allocation",path:"/driver-allocation"},{title:"Manifest",path:"/manifest"},{title:"Monitoring",path:"/monitoring"}]},
 {title:"Reports",path:"/reports",icon:BarChart3},
 {title:"AI Assistant",path:"/ai",icon:Bot},
 {title:"User Management",path:"/admin/users",icon:UserCog},
 {title:"Settings",path:"/settings",icon:Settings},
 {title:"Logout",path:"/logout",icon:LogOut},
];
export default navigation;
