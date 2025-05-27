import type { EventProps } from './calendar.tsx';
import { useNavigate } from 'react-router-dom';
import './form.css'

type formProps = {

    addEvent: (newEvent: EventProps, date: string) => void;

}

function Form(props: formProps){

    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
    
        const form = event.currentTarget;
        const when = (form.elements.namedItem('When') as HTMLInputElement).value
    
        const data: EventProps = {
          title: (form.elements.namedItem('Title') as HTMLInputElement).value,
          who: (form.elements.namedItem('Who') as HTMLInputElement).value,
          when: (form.elements.namedItem('When') as HTMLInputElement).value,
          where: (form.elements.namedItem('Where') as HTMLInputElement).value,
          what: (form.elements.namedItem('What') as HTMLInputElement).value,
          permissionCode: (form.elements.namedItem('Permission_Code') as HTMLInputElement).value,
        };
    
        props.addEvent(data, when);
        navigate('/dashboard');
        
      };

    return(

        <div className="Form_Container">

            <form className="Container_Container" onSubmit={handleSubmit}>

                <div className="Heading_Container">

                    <h1>Add an event</h1>

                </div>

                <div className="Title_Input_Container">
                    
                    <input id="Title" type="Text" placeholder="Title"/>

                </div>
                <div className="Inputs_Container">
                    <div className="Left_Container">
                        <input id="Who" type="Text" placeholder="Who"/>
                        <input id="When" name="When" type="Date" placeholder="When"/>

                    </div>
                    <div className="Right_Container">
                        <input id="Where" type="Text" placeholder="Where"/>
                        <input id="What" type="Text" placeholder="What"/>

                    </div>

                </div>

                <div className="Bottom_Container">
                    <div className="Permisison_Code_Container">
                        <input id="Permission_Code" type="Text" placeholder="Permission Code"/>
                    </div>
                    <div className="Submit_Button">
                        <button type="submit">Submit</button>
                    </div>

                </div>

                <div className="Go_Back_Container">

                    <a href="/">Go back</a>

                </div>

            </form>

        </div>

    );

};

export default Form;