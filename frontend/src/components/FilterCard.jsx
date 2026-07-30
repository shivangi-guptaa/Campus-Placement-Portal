import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";

const filterData = [
  {
    filterType: "Location",
    array: ["Bangalore", "Hyderabad", "Gurugram", "Pune", "Delhi NCR", "Remote"],
  },
  {
    filterType: "Industry / Role",
    array: [
      "Software Development",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack",
      "Internship",
    ],
  },
];

const FilterCard = () => {
  const [selectedValue, setSelectedValue] = useState("");
  const dispatch = useDispatch();

  const changeHandler = (value) => {
    setSelectedValue(value);
  };

  useEffect(() => {
    dispatch(setSearchedQuery(selectedValue));
  }, [selectedValue, dispatch]);

  return (
    <div className="w-full bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-xl text-gray-900 dark:text-white shadow-sm transition-colors">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg text-gray-900 dark:text-white">Filter Drives</h1>
        {selectedValue && (
          <button
            onClick={() => setSelectedValue("")}
            className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            Clear All
          </button>
        )}
      </div>
      <hr className="my-3 dark:border-gray-800" />
      <RadioGroup value={selectedValue} onValueChange={changeHandler}>
        {filterData.map((data, index) => (
          <div key={index} className="my-3">
            <h1 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">{data.filterType}</h1>
            {data.array.map((item, idx) => {
              const itemId = `id${index}-${idx}`;
              return (
                <div key={idx} className="flex items-center space-x-2 my-1.5">
                  <RadioGroupItem value={item} id={itemId} />
                  <Label htmlFor={itemId} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    {item}
                  </Label>
                </div>
              );
            })}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FilterCard;
