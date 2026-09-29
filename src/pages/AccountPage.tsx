import { AppScreen } from './AppScreen'
import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import api from '../api';



export function AccountPage() {
  const navigate=useNavigate();
  const[isDeleted, setIsDeleted]=useState(false);
  const [isOpen, setIsOpen]=useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleIsDeleted=async ()=>{
    setIsDeleted(true);
    setError(null);
    try{
      await api.delete('/account');//-----TO BE CHANGED-----
      localStorage.removeItem('authToken');
      navigate('/',{replace:true});
    }
    catch(err){
      console.log('Deleting failde', err);
      setError('Something went wrong. Please try again.');
  }
  finally{
    setIsDeleted(false);
  }
};

  return (
    <AppScreen kicker='' title="Account">
      <p className="section-copy">
        Office and loading users manage their profile, role, and yard access here.
      </p>
      <div className="panel" style={{ marginTop: 24, padding: 24 }}>
        <div className="field">
          <label htmlFor="account-name">Name</label>
          <input id="account-name" className="field-input" defaultValue="Operations user" readOnly />
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="account-role">Role</label>
          <input id="account-role" className="field-input" defaultValue="Office" readOnly />
        </div>
        <div className=' flex flex-row mt-5 gap-5'>
         
         <div>
          <h3 className='bg-accent rounded-xl text-white p-1.5 lg:p-3 hover:bg-accent-hover cursor-pointer'><a onClick={()=>navigate('/logout')}>Log Me Out</a></h3>
         </div>

         <div>
          <h3 className='bg-accent rounded-xl text-white p-1.5 lg:p-3 hover:bg-accent-hover cursor-pointer'><a onClick={()=>setIsOpen(true)}>Remove my account</a></h3>
         </div>
        </div>
      </div>
      
            {isOpen &&(
            <div className='fixed bg-white/30 backdrop-blur-md inset-0 flex justify-center  items-center'
            onClick={()=>setIsOpen(false)}>
            
              <div className='bg-white w-[500px] h-[350px] rounded-3xl border-3 lg:mt-17 border-accent flex flex-col '
              onClick={(e)=> e.stopPropagation()}>
                <h1 className='text-3xl font-bold text-center mt-10'>Delete account?</h1>
                <p className='pt-5 text-center text-xl'>You'll permanently lose <br></br> <u>profile</u> <br></br><u>history</u> <br></br><u>reports</u></p>
                  <p className="text-red-500 h-1 text-center ">
                    {error ??''}
                  </p>
                 
                <div className='bg-accent p-5 flex-1 mt-10 rounded-b-2xl flex justify-around items-center'>
                <button onClick={()=> setIsOpen(false)} className='rounded-xl p-3 w-[150px] bg-white text-xl font-bold text-black '>Cancel</button> 
                  <button className='rounded-xl p-3  w-[150px] bg-white text-black'
                  onClick={()=>handleIsDeleted()}
                     disabled={isDeleted}>
                     {isDeleted ? 'Deleting…' : 'Confirm'}
                  </button>
                 
                </div>
                 </div>
            </div>
          )}

    </AppScreen>
  )
}
