import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calendar from './calendar.tsx'
import Form from './form.tsx'
import Dashboard from './dashboard.tsx';
import type { EventProps } from './calendar.tsx';

export type Day = {

    day_num : number;
    date_index : string;
    weekday : string;
    events : EventProps[];


};


function App() {
      
    const curr_calendar = generateDateWeekdayMap(2025);
    const [day_dictionary, setEvents] = useState<Record<string,Day>>(curr_calendar);

    const [newEvents, setNewEvents] = useState<EventProps[]>([]);
    const [permissionCode, setPermissionCode] = useState<string>('');
    const [restricted, setRestricted] = useState<boolean>(false);

    console.log(newEvents);

    const addEvent = (newEvent: EventProps, date: string) => {

        if(restricted && permissionCode !== '' && newEvent.permissionCode !== permissionCode)
            return
      
        setEvents(prev => {
          const existingDay = prev[date];
      
          if (!existingDay) return prev; // ignore if date not found
      
          return {
            ...prev,
            [date]: {
              ...existingDay,
              events: [...existingDay.events, newEvent] // add new event
            }
          };
        });

        setNewEvents(prev => 
        [...prev, newEvent]
        );
      
        console.log(`Added event on ${date}:`, newEvent);
      };

      const removeEvent = (eventToRemove: EventProps, date: string) => {
        setEvents(prev => {
          const existingDay = prev[date];
      
          if (!existingDay) return prev; // date not found
      
          return {
            ...prev,
            [date]: {
              ...existingDay,
              events: existingDay.events.filter(event =>
                !areEventsEqual(event, eventToRemove)
              )
            }
          };
        });

        setNewEvents(prev => (

            prev.filter(event => !areEventsEqual(event, eventToRemove))

        ));

      };

      const approve_event = (approved : EventProps) => {

        setNewEvents(prev => 
            prev.filter(event => !areEventsEqual(approved,event))
          );

      }

      function areEventsEqual(a: EventProps, b: EventProps): boolean {
        return (
          a.title === b.title &&
          a.who === b.who &&
          a.when === b.when &&
          a.where === b.where &&
          a.what === b.what &&
          a.permissionCode === b.permissionCode
        );
      }


    return(

        <Router>
            <Routes>
                <Route path="/" element={<Calendar day_dictionary={day_dictionary}></Calendar>} />
                <Route path="/form" element={<Form addEvent={addEvent} />} />
                <Route path="/dashboard" element={<Dashboard events={newEvents} removeEvent={removeEvent} setPermissionCode={setPermissionCode} approve_event={approve_event} setRestricted={setRestricted}></Dashboard>}></Route>
            </Routes>
        </Router>

        

    );
    

}

function generateDateWeekdayMap(year : number) {
    const dateMap: Record<string,Day> = {};
    const startDate = new Date(year-1, 0, 1); // January 1st 2024
    const endDate = new Date(year+1, 11, 31); // December 31st 2026
  
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {

      const isoDate = d.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"

      dateMap[isoDate] = {date_index: isoDate, day_num: d.getDate(), weekday: weekday, events: []};
    }
  
    return dateMap;
  }


export default App;
