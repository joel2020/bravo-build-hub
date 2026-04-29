// ADD THIS AT TOP IMPORTS
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

// ADD STATE INSIDE COMPONENT
const [openCreate, setOpenCreate] = useState(false);
const [newLead, setNewLead] = useState({
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  service_type: "",
  message: "",
});

// ADD FUNCTION
const createLead = async () => {
  if (!newLead.name) {
    toast({ title: "Name required", variant: "destructive" });
    return;
  }

  const { error } = await supabase.from("leads").insert({
    name: newLead.name,
    phone: newLead.phone || null,
    email: newLead.email || null,
    address: newLead.address || null,
    city: newLead.city || null,
    service_type: newLead.service_type || null,
    message: newLead.message || null,
    status: "new",
    source: "manual",
  });

  if (error) {
    toast({ title: "Failed to create customer", description: error.message, variant: "destructive" });
    return;
  }

  await createActivity("Customer manually added", { details: newLead.name });

  toast({ title: "Customer added" });
  setOpenCreate(false);
  setNewLead({ name: "", phone: "", email: "", address: "", city: "", service_type: "", message: "" });
  load();
};

// ADD BUTTON IN UI (above search bar)
<Dialog open={openCreate} onOpenChange={setOpenCreate}>
  <DialogTrigger asChild>
    <Button className="mb-2">
      <Plus className="h-4 w-4 mr-1" /> Add Customer
    </Button>
  </DialogTrigger>

  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Customer</DialogTitle>
    </DialogHeader>

    <div className="grid gap-2">
      <Input placeholder="Name" value={newLead.name} onChange={e=>setNewLead({...newLead,name:e.target.value})} />
      <Input placeholder="Phone" value={newLead.phone} onChange={e=>setNewLead({...newLead,phone:e.target.value})} />
      <Input placeholder="Email" value={newLead.email} onChange={e=>setNewLead({...newLead,email:e.target.value})} />
      <Input placeholder="Address" value={newLead.address} onChange={e=>setNewLead({...newLead,address:e.target.value})} />
      <Input placeholder="City" value={newLead.city} onChange={e=>setNewLead({...newLead,city:e.target.value})} />
      <Input placeholder="Service (e.g. AC repair)" value={newLead.service_type} onChange={e=>setNewLead({...newLead,service_type:e.target.value})} />
      <Textarea placeholder="Notes" value={newLead.message} onChange={e=>setNewLead({...newLead,message:e.target.value})} />

      <Button onClick={createLead}>Save Customer</Button>
    </div>
  </DialogContent>
</Dialog>
