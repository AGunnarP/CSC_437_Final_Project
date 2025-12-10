import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calendar from './calendar.tsx'
import Form from './form.tsx'
import Dashboard from './dashboard.tsx';
import type { EventProps } from './calendar.tsx';
import { LoginPage } from './LoginPage.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';

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
    const [authToken, setAuthToken] = useState<string>("")

    console.log(authToken)

    console.log(newEvents);

    const addEvent = async (newEvent: EventProps, date: string) => {
      if (restricted && permissionCode !== '' && newEvent.permissionCode !== permissionCode) {
        return;
      }
    
      try {
        const response = await fetch("/api/dashboard/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ date, event: newEvent })
        });
    
        if (!response.ok) {
          console.error("❌ Failed to add event to dashboard.");
          return;
        }
    
        const result = await response.json();
        console.log("✅ Event successfully added:", result.event);
    
        // Optional: Update local UI state
        /*setNewEvents(prev => [...prev, newEvent]);
        setEvents(prev => {
          const existingDay = prev[date];
          if (!existingDay) return prev;
    
          return {
            ...prev,
            [date]: {
              ...existingDay,
              events: [...existingDay.events, newEvent]
            }
          };
        });*/
      } catch (error) {
        console.error("Error during API call to /dashboard/add:", error);
      }
    };
    

    const removeEvent = async (eventToRemove: EventProps, date: string) => {
      try {
        const response = await fetch("/api/dashboard/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ date, event: eventToRemove })
        });
    
    
        if (!response.ok) {
          console.error("❌ Failed to delete event from server");
          return;
        }
    
        // If successful, update local state
        setEvents(prev => {
          const existingDay = prev[date];
          if (!existingDay) return prev;
    
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
    
        setNewEvents(prev =>
          prev.filter(event => !areEventsEqual(event, eventToRemove))
        );
      } catch (error) {
        console.error("Error during API call to delete event:", error);
      }
    };
    
    

    const approve_event = async (approved: EventProps) => {
      try {
        const response = await fetch("/api/dashboard/approve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            date: approved.when,
            event: approved
          })
        });
    
        if (!response.ok) {
          console.error("❌ Failed to approve event on server");
          return;
        }
    
        setNewEvents(prev =>
          prev.filter(event => !areEventsEqual(event, approved))
        );
    
        console.log("✅ Event approved and moved to events collection");
    
        // 🔁 Refresh calendar from /api/events
        await refreshApprovedEvents();
      } catch (error) {
        console.error("Error approving event:", error);
      }
    };

    const refreshApprovedEvents = async () => {
      try {
        
        
        const token = localStorage.getItem("authToken");
    
        const response = await fetch("/api/events", {
          headers: {
            Authorization: `Bearer ${token ?? ""}`
          }
        });
    
        if (!response.ok) {
          console.error("❌ Failed to fetch approved events", response.json());
          return;
        }
    
        const eventList: EventProps[] = await response.json();
    
        setEvents(prev => {
          // First, make a fresh copy of prev
          const updated = { ...prev };
    
          // 🧹 Step 1: clear out ALL existing events
          for (const key in updated) {
            updated[key] = {
              ...updated[key],
              events: []
            };
          }
    
          // 🧩 Step 2: insert the new events by date
          for (const event of eventList) {
            const date = event.when;
            if (!updated[date]) continue;
    
            updated[date] = {
              ...updated[date],
              events: [...updated[date].events, event]
            };
          }
    
          return updated;
        });
    
        console.log("✅ Approved events refreshed and merged");
      } catch (err) {
        console.error("❌ Error refreshing events:", err);
      }
    };

    const removeExistingEvent = async (eventToRemove: EventProps, date: string) => {

      try{

        const response = await fetch("/api/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ date, event: eventToRemove })
        });

        if (!response.ok) {

          //LOGOUT
          localStorage.removeItem("authToken");
          localStorage.removeItem("Username");
          window.location.reload();
          console.error("❌ Failed to delete existing event from server");
          return;
        }
    
        // If successful, update local state
        setEvents(prev => {
          const existingDay = prev[date];
          if (!existingDay) return prev;
    
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


      }catch(error){

        console.error("Problem removing existing event", error);

      }

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
      

      useEffect(() => {
        const savedToken = localStorage.getItem("authToken");
        if (savedToken) {
          setAuthToken(savedToken);
        }
        refreshApprovedEvents()
      }, []);


    return(

      <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage setAuthToken={setAuthToken} />} />
        <Route path="/register" element={<LoginPage isRegistering={true} setAuthToken={setAuthToken} />} />
        <Route
          path="/" element={<Calendar day_dictionary={day_dictionary} removeExistingEvent={removeExistingEvent}/>}/>
    
        {/* Protected Routes */}
        <Route
          path="/form"
          element={
            <ProtectedRoute authToken={authToken}>
              <Form addEvent={addEvent} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute authToken={authToken}>
              <Dashboard
                removeEvent={removeEvent}
                setPermissionCode={setPermissionCode}
                approve_event={approve_event}
                setRestricted={setRestricted}
              />
            </ProtectedRoute>
          }
        />
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
