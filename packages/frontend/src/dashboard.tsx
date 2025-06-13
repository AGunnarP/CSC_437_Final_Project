import { useEffect, useState } from 'react';
import { Event } from './calendar.tsx';
import type { EventProps } from './calendar.tsx';
import './dashboard.css';

type Dashboard_Props = {
  removeEvent: (eventToRemove: EventProps, date: string) => void;
  setPermissionCode: (code: string) => void;
  approve_event: (approved: EventProps) => void;
  setRestricted: (restriction: boolean) => void;
};

type Approval_props = {
  event: EventProps;
};

var ticker : number = 0;

function Dashboard(props: Dashboard_Props) {
  const [fetchedEvents, setFetchedEvents] = useState<EventProps[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
  
    fetch('/api/dashboard/events', {
      headers: {
        Authorization: `Bearer ${token ?? ''}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`Failed to fetch events: ${res.status}`, text);
          return;
        }
  
        const data: EventProps[] = await res.json();
        setFetchedEvents(data);
      })
      .catch(err => console.error("Error loading events:", err));
  }, [ticker]);
  
  console.log(fetchedEvents);

  function Approval(approval_props: Approval_props) {
    return (
      <div className="Approval_Container">
        <Event {...approval_props.event} />
        <button
          onClick={() => {
            props.approve_event(approval_props.event);
            ticker++;
        }}
          className="Tick_Yes"
        >
          ✓
        </button>
        <button
          onClick={() => {
            props.removeEvent(approval_props.event, approval_props.event.when);
            ticker++;
          }}
          className="Tick_No"
        >
          X
        </button>
      </div>
    );
  }


  return (
    <div>
      {fetchedEvents.map((thing, i) => (
        <Approval key={`${thing.title}-${thing.when}-${i}`} event={thing} />
      ))}
    </div>
  );
}

export default Dashboard;
