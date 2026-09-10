import api from "./api";
const userService={list:()=>api.get("/users"),create:p=>api.post("/users",p),update:(id,p)=>api.patch(`/users/${id}`,p),setStatus:(id,active)=>api.patch(`/users/${id}/status`,{active}),resetPassword:id=>api.post(`/users/${id}/reset-password`),delete:id=>api.delete(`/users/${id}`)}; export default userService;
