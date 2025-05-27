import {Event} from './calendar.tsx'
import type { EventProps } from './calendar.tsx'
import './dashboard.css'

type Dashboard_Props = {

    removeEvent : (eventToRemove: EventProps, date: string) => void;
    setPermissionCode : (code : string) => void;
    approve_event : (approved : EventProps) => void;
    setRestricted : (restriction: boolean) => void;
    events : EventProps[];

}

type Approval_props = {

    event : EventProps;

}




function Dashboard(props : Dashboard_Props){

    console.log(props.events)

    function Approval(approval_props : Approval_props){

        return(
    
            <div className="Approval_Container">
    
                <Event  {...approval_props.event}/>
                <button onClick={() => props.approve_event(approval_props.event)} className="Tick_Yes">✓</button>
                <button onClick={() => props.removeEvent(approval_props.event, approval_props.event.when)} className="Tick_No">X</button>
    
             </div>
    
        );
    }

    function Toggle(){

        return(

            <div className="Bottom_Container">
                <div className="Toggle_Container">

                    <p>Restrict by code?</p>
                    <label className="checkbox">
                        <input onChange={e => props.setRestricted(e.target.checked)} type="checkbox"/>
                        <span className="box"></span>
                    </label>

                </div>
                <div className="Input_Container">
                    <input onChange={e => props.setPermissionCode(e.target.value)} type="Text"/>
                </div>
            </div>

        );

    }

    return(

        <div>

            {props.events.map((thing, i) => (
                <Approval key={`${thing.title}-${thing.when}-${i}`} event={thing} />
            ))}

            <Toggle></Toggle>

        </div>
        
    )

}


export default Dashboard;