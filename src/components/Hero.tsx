import { motion } from 'framer-motion'
import './Hero.css'


const steps = [
  {
    n: '1',
    title: 'Set vehicle size',
    text: 'Enter length, width, height, and payload limits to define your exact cargo constraints.',
    text1:'Custom L × W × H limits',
    text2: 'Axle weight restrictions', 
    text3: 'Metric & Imperial support'
  },
  {
    n: '2',
    title: 'Upload the BOL',
    text: 'Drop a PDF or image scan. We extract items instantly without interfering with external servers.',
    text1: 'Zero server data exposure',
    text2: 'Instant item line extraction', 
    text3: 'Supports PDF, PNG, JPG'
  },
  {
    n: '3',
    title: 'Plan the load',
    text: 'Visualize cargo arrangement inside the vehicle volume before loading dock execution.',
    text1: '3D spatial distribution', 
     text2: ' Weight distribution indicator', 
      text3: 'One-click load sheet export'
  },
]

export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
        <motion.img   src="https://png.pngtree.com/thumb_back/fh260/background/20240703/pngtree-variety-of-packed-moving-boxes-in-empty-room-image_15846639.jpg" 
       alt="cargo"
       className='background'
        initial={{ opacity: 0, }}
            animate={{ opacity: 0.5,  }}
            transition={{ duration: 0.4 }}
      
        
      />
      <div className="wrap hero-grid">
        <div>
          
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            Arrange cargo to fit <i style={{color:' var(--accent)',
              fontSize: 55,
              letterSpacing:'0em',
              fontFamily: "Edu VIC WA NT Hand",
              marginLeft:'5px'
            }}>your</i> vehicle.
          </motion.h1>
          <motion.p
            className="hero-lead"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            Enter vehicle dimensions, upload a bill of lading, and plan the load
            against real space and payload.
          </motion.p>
         
          <motion.dl
            className="hero-metrics"
            
          aria-label="How Smart Cargo works"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="steps">
            {steps.map((step, index) => (
             
              <motion.div
                key={step.n}
                className="step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + index * 0.08, duration: 0.4 }}
              >
                <span className="step-num">{step.n}</span>
                <div className='ppp'>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <p> <symbol>✓</symbol> {step.text1}</p>
                  <p> <symbol>✓</symbol> {step.text2}</p>
                  <p> <symbol>✓</symbol> {step.text3}</p>
                </div>
              </motion.div> 
            ))}
            </div>
          </motion.dl>
        </div>

        
      </div>
    </section>
  )
}
