import React, { useState } from "react";
import ReactDOM from "react-dom";
import eventsData from "@/data/events";
import HTML5Backend from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
// import "./custom-calendar.css"; // Custom styles for the design

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);

const DndCalendar = () => {
  const [events, setEvents] = useState(eventsData);

  const moveEvent = ({ event, start, end }) => {
    const updatedEvent = { ...event, start, end };
    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id ? updatedEvent : existingEvent
    );
    setEvents(updatedEvents);
  };

  const resizeEvent = (resizeType, { event, start, end }) => {
    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id ? { ...event, start, end } : existingEvent
    );
    setEvents(updatedEvents);
  };

  return (
    <div className="custom-calendar-container">
      <DragAndDropCalendar
        selectable
        localizer={localizer}
        events={events}
        onEventDrop={moveEvent}
        resizable
        onEventResize={resizeEvent}
        defaultView="week"
        views={["week", "day"]}
        defaultDate={new Date(2015, 3, 12)}
        style={{ height: "100vh" }}
        step={30}
        timeslots={1}
        min={new Date(2015, 3, 12, 0, 0, 0)}
        max={new Date(2015, 3, 12, 23, 59, 59)}
        components={{
          timeSlotWrapper: (props) => (
            <div {...props} className="custom-time-slot" />
          ),
          eventWrapper: (props) => (
            <div {...props} className="custom-event-wrapper">
              {props.children}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default DndCalendar;
