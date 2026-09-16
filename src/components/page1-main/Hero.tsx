import './Hero.css'
import { HistoryTable } from './HistoryTable'



export function Hero() {
  return (
    <section className="hero" id="hero" >
       <div className="img-container">
        <div className="dreptunghi">
          <h2>Track your recent shippments</h2>
        </div>
       </div>

       <HistoryTable />
     
        
        

        
   
    </section>
  )
}
