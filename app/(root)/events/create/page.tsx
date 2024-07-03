import EventForm from '@/components/shared/EventForm'
import React from 'react'

const CreateEvent = () => {
  return (
    <section className='bg-primary-5 bg-cover bg-center py-5 md:py-10'>
        <h3 className='wrapper h3-bold text-center sm:text-left'>Create Event</h3>

        <div className='wrapper my-8 '>
            <EventForm userId="userId" type="Create"/>
        </div>
    </section>
  )
}

export default CreateEvent
