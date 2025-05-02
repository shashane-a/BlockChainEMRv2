import { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Appointments.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { toast, ToastContainer } from "react-toastify";

export default function Appointments() {
  return (
    
    <div className="flex flex-col h-[100vh]">
      <ToastContainer position="bottom-right" autoClose={5000} theme='colored' />
      {/* Header */}
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
      </div>


        <div className="flex-1 overflow-hidden px-4 py-4 pb-4 m-4 bg-white rounded shadow">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]} 
            initialView="dayGridMonth"
            height="100%"
            weekends={true}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short' // shows 'AM' or 'PM'
            }}
            events={[
              {
                title: 'Check-up',
                start: '2025-05-03T10:30:00',
                end: '2025-05-03T11:30:00',
                backgroundColor: '#3F72AF',
              },
            ]}
            eventClick={(info) => {
              // Prevent default browser behavior (e.g., if href is present)
              info.jsEvent.preventDefault();
          
              // Access event details
              const title = info.event.title;
              const start = info.event.start;
              const id = info.event.id;
          
              toast.info(`Event: ${title} \nStart: ${start} \nID: ${id}`);

            }}
          />
        </div>
    </div>
  );
}
