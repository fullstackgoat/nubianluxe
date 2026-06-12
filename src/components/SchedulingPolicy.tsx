'use client'

import { MotionDiv } from './motion/MotionDiv'
import { Clock, Plus, DollarSign, Calendar, AlertTriangle, RefreshCw, CreditCard, Ruler, Users } from 'lucide-react'
import Image from 'next/image'

interface PolicySectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

const PolicySection = ({ title, icon, children }: PolicySectionProps) => (
  <MotionDiv
    className="mb-8"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-primary/20 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    <div className="pl-12 text-gray-700 space-y-2">
      {children}
    </div>
  </MotionDiv>
)

export default function SchedulingPolicy() {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#FDF5E6]/80" />
      
      <div className="relative px-4 py-20 max-w-7xl mx-auto">
        <MotionDiv
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            SCHEDULING POLICY
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Please review our scheduling policies to ensure a smooth and enjoyable experience
          </p>
        </MotionDiv>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
          <div>
            <PolicySection 
              title="APPOINTMENTS" 
              icon={<Clock className="w-6 h-6 text-primary" />}
            >
              <p>24/7 APPOINTMENTS ARE AVAILABLE.</p>
            </PolicySection>

            <PolicySection 
              title="ADD-ONS" 
              icon={<Plus className="w-6 h-6 text-primary" />}
            >
              <p>PLEASE MAKE SURE THERE ARE NO APPLICABLE ADD-ONS FOR YOUR DESIRED SERVICE.</p>
            </PolicySection>

            <PolicySection 
              title="DEPOSITS" 
              icon={<DollarSign className="w-6 h-6 text-primary" />}
            >
              <p>A $44 DEPOSIT IS DUE AT THE TIME OF BOOKING. THE DEPOSIT WILL BE SUBTRACTED FROM THE TOTAL SERVICE BALANCE.</p>
            </PolicySection>

            <PolicySection 
              title="BOOKING FEE" 
              icon={<Calendar className="w-6 h-6 text-primary" />}
            >
              <p>A NON-REFUNDABLE BOOKING FEE OF $25 FOR PREMIUM OR $50 FOR VIP IS REQUIRED TO SECURE YOUR APPOINTMENT.</p>
              <p className="font-semibold">✨ TRADITIONAL APPOINTMENTS DO NOT REQUIRE A BOOKING FEE.</p>
            </PolicySection>

            <PolicySection 
              title="THE CLIENT IS RUNNING LATE" 
              icon={<AlertTriangle className="w-6 h-6 text-primary" />}
            >
              <p>IT IS UP TO THE CLIENT TO CONTACT THE STYLIST IF UNABLE TO BE PRESENT AT THE APPOINTMENT TIME. THE $44 DEPOSIT WILL HOLD YOUR APPOINTMENT UP TO 60 MINUTES. AFTER THIS PERIOD, THE APPOINTMENT WILL BE CANCELED. DEPOSITS AND BOOKING FEES ARE NON-REFUNDABLE AND NON-TRANSFERABLE. A NEW DEPOSIT AND BOOKING FEE WILL BE REQUIRED TO RESCHEDULE.</p>
            </PolicySection>
          </div>

          <div>
            <PolicySection 
              title="RESCHEDULING" 
              icon={<RefreshCw className="w-6 h-6 text-primary" />}
            >
              <p>ALL APPOINTMENTS SHOULD BE RESCHEDULED WITH A 48+ HOUR NOTICE. THE DEPOSIT &amp; BOOKING FEE IS TRANSFERRABLE (NOT REFUNDABLE) IF THE NEW APPOINTMENT IS DATED WITHIN 21 DAYS OF THE ORIGINAL APPOINTMENT DATE. ONE RESCHEDULE ALLOWED PER DEPOSIT.</p>
            </PolicySection>

            <PolicySection 
              title="REMAINING BALANCE PAYMENT" 
              icon={<CreditCard className="w-6 h-6 text-primary" />}
            >
              <p>TO ENSURE SATISFACTION, SCHEDULED CHECKPOINTS WILL BE INCLUDED THROUGHOUT THE INSTALLATION PROCESS. THESE CHECKPOINTS ALLOW THE CLIENT TO REVIEW THE PROGRESS AND PROVIDE APPROVAL BEFORE MOVING FORWARD. SUBSECTIONS AND CHECKPOINTS WILL BE DISCUSSED AND AGREED UPON PRIOR TO THE START OF THE INSTALLATION.  THE FINAL CHECKPOINT WILL OCCUR WHEN APPROXIMATELY 80% OF THE SERVICE IS COMPLETE.  AT THIS POINT, THE SERVICE WILL PAUSE TO COLLECT THE REMAINING BALANCE BEFORE PROCEEDING WITH COMPLETION.</p>
              <p>WE APPRECIATE YOUR UNDERSTANDING AND COOPERATION IN ADHERING TO THIS POLICY, WHICH HELPS MAINTAIN THE INTEGRITY AND FAIRNESS OF LABOR-INTENSIVE WORK.</p>
            </PolicySection>

            <PolicySection 
              title="HAIR LENGTH CHART" 
              icon={<Ruler className="w-6 h-6 text-primary" />}
            >
              <p>ABOUT 2 INCHES OF NATURAL HAIR IS NEEDED FOR STYLES XXSMALL TO MEDIUM. THICK HAIR MAY NEED TO BE AT LEAST 3 INCHES.</p>
              
              <div className="h-[350px] relative w-full">
                <Image
                  src="/hair-length-chart.svg"
                  alt="Hair Length Chart"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              <p className="mt-4 text-sm text-gray-600 italic">
                * ADDITIONAL CHARGES MAY APPLY FOR HAIR LENGTH EXCEEDING HIP LENGTH. PLEASE INQUIRE FOR CUSTOM PRICING.
              </p>
            </PolicySection>

            <PolicySection 
              title="EXTRA GUEST" 
              icon={<Users className="w-6 h-6 text-primary" />}
            >
              <p>ONE PARENT OR GUARDIAN IS WELCOME (AND STRONGLY SUGGESTED) IF ACCOMPANYING A CLIENT WHO IS UNDER THE AGE OF 18.  NO EXTRA GUEST FOR ANY OTHER REASON IS ACCEPTABLE.</p>
            </PolicySection>
          </div>
        </div>
      </div>
    </section>
  )
}
