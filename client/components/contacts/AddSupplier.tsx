import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/useUser';

const initialValue = {
  name: '',
  company_name: '',
  email: '',
  contact_type: 'SP',
  status: 'NE',
  phone: '',
  surname: '',
  address: '',
};

const AddSupplier = ({ 
  refetchSupplier, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen,
  renderTrigger = true 
}: { 
  refetchSupplier: any, 
  open?: boolean, 
  onOpenChange?: (open: boolean) => void,
  renderTrigger?: boolean
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const setOpen = (val: boolean) => {
    if (setControlledOpen) {
      setControlledOpen(val);
    } else {
      setInternalOpen(val);
    }
  };

  const queryClient = useQueryClient();
  const { user } = useUser();
  
    const { mutate: createContact, isPending: isCreating } = usePost({
      onSuccess: () => {
        queryClient.refetchQueries({ queryKey: ['crm/studio-contacts/'] });
        queryClient.refetchQueries({ queryKey: ['crm/studio-clients/'] });
        queryClient.refetchQueries({ queryKey: ['crm/studio-suppliers/'] });
        toast('Contact created successfully!');
        setOpen(false);
      },
      onError: () => {
        toast('Error! Try again');
      },
    });

  const [defaultValue, setDefaultValue] = useState(initialValue);


  const updateTask = React.useCallback((e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setDefaultValue(prevTask => ({
      ...prevTask,
      [name]: value,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (defaultValue.name.length < 2) {
      toast.error('First Name Required');
      return;
    }
    if (defaultValue.company_name.length < 1) {
      toast.error('Company Required');
      return;
    }

    const payload = {
      ...defaultValue,
      studio: user?.studio?.id,
    };

    createContact({ url: 'crm/clients/', data: payload });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {renderTrigger && (
        <DialogTrigger asChild>
          <button 
            className="text-sm w-full border-t px-2 py-3 text-center hover:bg-stone-100 transition-colors font-medium text-blue-600"
          >
            Add Supplier
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[625px] z-[10000]">
        <DialogHeader>
          <DialogTitle>Add Supplier</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 ">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.name}
                className="bg-white rounded-lg"
                id="name"
                name="name"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Surname</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.surname}
                className="bg-white rounded-lg"
                id="surname"
                name="surname"
                placeholder="Johh"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.email}
                className="bg-white rounded-lg"
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.phone}
                className="bg-white rounded-lg"
                id="phone"
                name="phone"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className={`space-y-2 col-span-2`}>
              <Label htmlFor="status">Status</Label>
              <Select
                value={defaultValue.status}
                onValueChange={value => {
                  updateTask({
                    target: {
                      name: 'status',
                      value: value,
                    },
                  });
                }}
              >
                <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[9999]">
                  <SelectItem value="NE">New</SelectItem>
                  <SelectItem value="AC">Active</SelectItem>
                  <SelectItem value="QA">Qualified</SelectItem>
                  <SelectItem value="NG">Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="company">Company</Label>
              <Input
                onChange={updateTask}
                value={defaultValue?.company_name}
                className="bg-white rounded-lg"
                id="company_name"
                name="company_name"
                placeholder="Company Name"
                required
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="budget">Address</Label>
            <Textarea
              onChange={updateTask}
              value={defaultValue?.address}
              className="bg-white rounded-lg"
              id="address"
              name="address"
              placeholder="e.g. Street	53060 N Carolina 12
"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplier;
