"use client";

import React, { useState, useEffect } from 'react';
import { Save, ArrowUpToLine,Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from "next-auth/react";
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CreatePage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing,setIsEditing]=useState(false);
  const { data: session, status } = useSession();
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  if(status==="loading"){
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }
  return (
    // flex flex-col
    <div className=" relative mt-15 ml-15 mr-15 px-[20]  items-center">
      {/* bg-gray-900  text-gray-300  rounded-lg*/}
      <div className='flex items-center justify-between p-5'>
        <div className='flex items-center space-x-4'>
          <Avatar className="w-12 h-12 border-0 !border-none !shadow-none !ring-0">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name || "User"} loading="lazy" />
              ) : (
                <AvatarFallback className="bg-gray-500 text-white">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className='text-customLight dark:text-customDark font-semibold'>{session?.user.name || "Guest"}</p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
              <Popover>
                  <PopoverTrigger asChild>
                    <span
                      className="cursor-pointer hover:underline text-black dark:text-white"
                      role="button"
                    >
                      {new Date(date || new Date()).toLocaleDateString("en-GB")}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] bg-[#faf9f6] dark:bg-[#1e1e1e] p-2 shadow-lg rounded-md border border-gray-300 dark:border-gray-700">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="border-none text-xs w-full bg-[#faf9f6] dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 rounded-md"
                    />
                  </PopoverContent>
              </Popover>

                <span> • </span><span>Draft</span></p>
            </div>
            <div className='flex absolute top-4 right-4 justify-end space-x-2 '>
              <Button className="w-8 h-8 flex items-center justify-center 
                bg-[#EAE9E6] text-black dark:bg-[#2f2f2f] dark:text-white 
                shadow-md rounded-full transition-all duration-200 
                hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-lg">
                <Undo2 />
              </Button>

              <Button className="w-8 h-8 flex items-center justify-center 
                bg-[#EAE9E6] text-black dark:bg-[#2f2f2f] dark:text-white 
                shadow-md rounded-full transition-all duration-200 
                hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-lg">
                <Redo2 />
              </Button>


            </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Create</h1>
       
      </div>
      
      {/* Your CMS components go below */}
      <div>
        <p>Your CMS editor components go here...</p>
      </div>
    </div>
  );
};

export default CreatePage;



// <div class="flex items-center justify-between p-4 bg-gray-900 text-gray-300 rounded-lg">
//   <!-- Author Info -->
//   <div class="flex items-center space-x-4">
//     <!-- Profile Image -->
//     <div class="w-10 h-10 bg-gray-700 rounded-full"></div>
    
//     <!-- Author Name and Date -->
//     <div>
//       <p class="text-white font-semibold">Author Name</p>
//       <p class="text-sm text-gray-400">12/05/2023</p>
//     </div>

//     <!-- Draft Checkbox and Label -->
//     <div class="flex items-center space-x-2">
//       <input type="checkbox" class="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-0" />
//       <span class="text-gray-400 text-sm">Draft</span>
//     </div>
//   </div>

//   <!-- Action Buttons -->
//   <div class="flex space-x-2">
//     <button class="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700">
//       🔄 <!-- Replace with an actual icon -->
//     </button>
//     <button class="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700">
//       ➡ <!-- Replace with an actual icon -->
//     </button>
//   </div>
// </div>
