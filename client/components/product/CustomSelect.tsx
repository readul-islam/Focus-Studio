import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomSelect = ({ product, updateProduct }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(product?.type || "");

  const allOptions = ["Furniture", "Lighting", "Hardware", "Fabrics", "Flooring", "Paint", "Accessories", "Other"];

  const handleSelectChange = (currentValue) => {
    setValue(currentValue);
    const e = {
      target: {
        name: "type",
        value: currentValue,
      },
    };
    updateProduct(e);
    setOpen(false);
  };

  const handleAddOption = () => {
    if (newOption && !allOptions.includes(newOption)) {
      setCustomOptions([...customOptions, newOption]);
      setNewOption("");
      handleSelectChange(newOption);
    }
  };

  return (
    <div className="space-y-2 col-span-2 mt-3">
      <Label htmlFor="type">Type</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="bg-white rounded-[10px] w-full px-3 py-[10px] border justify-between">
            {value ? value : "Select type"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white z-[999]">
          <Command>
            <CommandInput placeholder="Search type..." />
            <CommandList>
              <CommandEmpty>
                <p className="py-2 px-4 text-sm">No type found.</p>
              </CommandEmpty>
              {allOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelectChange(option)}
                  className="flex items-center cursor-pointer">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomSelect;
