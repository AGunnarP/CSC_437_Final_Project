import { useState } from 'react';
import type {Day} from './App.tsx'
import './Calendar.css';
import Header from './Header';



type CalendarProps = {

    day_dictionary : Record<string, Day>;

}

type DayProps = {

    day_num : number;
    date_index : string;

};

export type EventProps = {

    title : string;
    who : string;
    when : string;
    where : string;
    what : string;
    permissionCode? : string;

};

type navProps = {

    month : string;
    year : number;
    nav_fwd : () => void;
    nav_prev : () => void;

}


function Calendar(props : CalendarProps){

    const [today, setCurrentDate] = useState(new Date());
    const year = today.getFullYear();        // e.g., 2025
    const month = today.toLocaleString('default', { month: 'long' }); // → "May"
    const { monday, sunday } = getMonthWeekRange(today);

    const sliced = sliceDateMapByRange(props.day_dictionary, monday, sunday);

    const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

    const handleDayClick = (dayNumber: number, date_index : string) => {

        if(!isInCurrentMonth(date_index))
            return
        setSelectedDay(dayNumber);
        setSelectedEvents(date_index);
    };

    
    const [selectedEvents, setSelectedEvents] = useState<string>(today.toISOString().split('T')[0]);
    console.log(`Selected events is: ${selectedEvents}`);


    const Day = ({ day_num, date_index }: DayProps) => {

        let isSelected = day_num === selectedDay;
        let currentMonth = isInCurrentMonth(date_index);

        return <div className={currentMonth ? `Day ${isSelected ? 'selected' : ''}` : 'Greyed_Out'} 
        onClick={() => handleDayClick(day_num, date_index)}><p>{day_num}</p></div>;
    
      };

      function update(new_date : Date){

        setSelectedDay(new_date.getDate());
        setSelectedEvents((new_date.toISOString().split('T')[0]));

      }

      const nav_fwd = () => {

        let new_date = addMonth(today);
        setCurrentDate(new_date);
        update(new_date);

      }

      const nav_prev = () => {

        let new_date = subtractMonth(today);
        setCurrentDate(new_date);
        update(new_date);

      }

      function isInCurrentMonth(isoDate: string): boolean {
        const [year, month] = isoDate.split('-').map(Number);
        
        return (
          today.getFullYear() === year &&
          today.getMonth() + 1 === month // JS months are 0-indexed
        );
      }

    return(

        <div className="body_container">
            <Header/>

            <div className = "Calendar_Container">

                <Calendar_nav nav_fwd={nav_fwd} nav_prev={nav_prev} month={month} year={year}></Calendar_nav>

                <Day_Headers></Day_Headers>

                <div className="Calendar_Grid">


                {Object.entries(sliced).map(([date, day], _) => (
                    
                    <Day key={date} date_index={day.date_index} day_num={day.day_num} />
                ))}
                    

                </div>

            </div>


            <div className="Container_Container">
                <div className="Events_Container">

                    {sliced[selectedEvents].events.map((thing, i) => (

                        <Event key={i} {...thing}></Event>

                    ))}
                    
                </div>
            </div>

            <AddMoreButton></AddMoreButton>

        </div>
        

        

    );

}

function Calendar_nav(props : navProps){

    return(

        <div className="nav_container">
        <button onClick={props.nav_prev} className="nav_prev">{'<'}</button>
        <p>{props.month} {props.year}</p>
        <button onClick={props.nav_fwd} className="nav_fwd">{'>'}</button>
    </div>

    );
    

}

function Day_Headers(){

    return(
        <div className="Day_Headers">

            <p>Monday</p>
            <p>Tuesday</p>
            <p>Wednesday</p>
            <p>Thursday</p>
            <p>Friday</p>
            <p>Saturday</p>
            <p>Sunday</p>

        </div>
    );

}

export function Event(props : EventProps){

    return(

        <div className="Event_Container">

            <div className="Event">

            <dl>
                <dt>{props.title}</dt>

                <dd>Who: {props.who}</dd>
                <dd>When: {props.when}</dd>
                <dd>Where: {props.where}</dd>
                <dd>What: {props.what}</dd>

            </dl>

            </div>

        </div>
        
    );

}

function AddMoreButton(){

    return(
        <div className="Container_Container">
            <div className="Add_more_container">

                <a className="Add_More_Button" href="/form">+ Add more</a>

            </div>

        </div>
    );

}


function getMonthWeekRange(date: Date): { monday: string; sunday: string } {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
  
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0); // Last day of the month
  
    // Monday of the week containing the 1st
    const startDay = startOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const mondayOffset = (startDay + 6) % 7; // Convert so Monday is 0
    const monday = new Date(startOfMonth);
    monday.setDate(startOfMonth.getDate() - mondayOffset);
  
    // Sunday of the week containing the last day of the month
    const endDay = endOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const sundayOffset = (7 - endDay) % 7;
    const sunday = new Date(endOfMonth);
    sunday.setDate(endOfMonth.getDate() + sundayOffset);
  
    // Format to ISO date string (YYYY-MM-DD)
    return {
      monday: monday.toISOString().split('T')[0],
      sunday: sunday.toISOString().split('T')[0],
    };
  }

  function sliceDateMapByRange(
    dateMap: Record<string, Day>,
    startDate: string,
    endDate: string
  ): Record<string, Day> {
    const result: Record<string, Day> = {};
  
    for (const dateStr of Object.keys(dateMap)) {
      if (dateStr >= startDate && dateStr <= endDate) {
        result[dateStr] = dateMap[dateStr];
      }
    }
  
    return result;
  }



    // Adds one month to a given date
    function addMonth(date: Date): Date {
        const next = new Date(date);
        next.setMonth(next.getMonth() + 1);
    
        // If original date was the 31st and next month has fewer days, JS auto-adjusts
        return next;
    }
  
  // Subtracts one month from a given date
  function subtractMonth(date: Date): Date {
    const prev = new Date(date);
    prev.setMonth(prev.getMonth() - 1);
    return prev;
  }


export default Calendar;
