import { AppScreen } from './AppScreen'
import {useNavigate} from 'react-router-dom';



export function AccountPage() {
  const navigate=useNavigate();

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
          <h3 className='bg-accent rounded-xl text-white p-3 hover:bg-accent-hover cursor-pointer'><a onClick={()=>navigate('/logout')}>Log Me Out</a></h3>
         </div>

         <div>
          <h3 className='bg-accent rounded-xl text-white p-3 hover:bg-accent-hover cursor-pointer'><a onClick={()=>navigate('/')}>Remove my account</a></h3>
         </div>
        </div>
      </div>

    </AppScreen>
  )
}
