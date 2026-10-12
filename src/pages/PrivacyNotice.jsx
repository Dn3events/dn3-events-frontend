import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { checkouts } from '../api/checkouts'

// DRAFT: wording awaiting the owner's approval (a solicitor check is advisable).
// The controller name is the one place that identifies who is legally responsible for the data.
export const DEFAULT_CONTROLLER_NAME = 'The Foundry Initiative Events Ltd'
export const DEFAULT_CONTROLLER_NUMBER = '17495327'
export const DEFAULT_CONTROLLER_ADDRESS = 'Unit 8 Laceby Business Park, Laceby, Grimsby, North East Lincolnshire, DN37 7DP'
export const DEFAULT_CONTROLLER_EMAIL = 'dn3events@gmail.com'
export const RETENTION_MONTHS = 36

export default function PrivacyNotice() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)

  useEffect(() => {
    if (!slug) return
    checkouts.getBySlug(slug).then((r) => setEvent(r.data.data.event)).catch(() => {})
  }, [slug])

  const controller = event?.controllerName || DEFAULT_CONTROLLER_NAME
  const number = event?.controllerCompanyNumber || DEFAULT_CONTROLLER_NUMBER
  const address = event?.controllerAddress || DEFAULT_CONTROLLER_ADDRESS
  const email = event?.controllerEmail || DEFAULT_CONTROLLER_EMAIL
  const eventName = event?.name

  const H = ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{children}</h2>
  const P = ({ children }) => <p className="text-gray-700 leading-relaxed mb-2">{children}</p>
  const L = ({ items }) => (
    <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-2 space-y-1">
      {items.map((i) => <li key={i}>{i}</li>)}
    </ul>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">Privacy notice</h1>
          <p className="text-sm text-gray-500 mb-4">
            {eventName ? `For ticket buyers and attendees of ${eventName}. ` : ''}Last updated: October 2026
          </p>

          <H>Who we are</H>
          <P>
            {controller} (&ldquo;we&rdquo;) is responsible for the personal information you give us when you buy a
            ticket. Our company number is {number} and our registered office is {address}. You can contact us at <a className="text-indigo-600 underline" href={`mailto:${email}`}>{email}</a>.
            Tickets are sold through the DN3 Events ticketing system, which handles your information on our behalf and
            only as we instruct.
          </P>

          <H>What we collect</H>
          <L items={[
            'Your name, email address and postcode.',
            'What you ordered: ticket types, quantities, discount codes used, the price paid and the date.',
            'Your answers to any questions the organiser asked at checkout.',
            'When your ticket is scanned at the door.',
            'Whether you chose to receive news from us (you can say no and still buy a ticket).',
          ]} />
          <P>We do not see or store your card number. Card payments are handled by Stripe.</P>

          <H>Why we use it, and our lawful basis</H>
          <L items={[
            'To sell you a ticket, take payment, email your ticket and order confirmation, and let you in at the door. Basis: it is needed for the contract with you.',
            'To run the event safely and deal with refunds, queries and complaints. Basis: our legitimate interest in running the event properly.',
            'To keep financial records and meet tax and accounting rules. Basis: legal obligation.',
            'To email you about this event and future events, only if you ticked the box at checkout. Basis: your consent. You can withdraw it at any time.',
          ]} />

          <H>Who we share it with</H>
          <P>We do not sell your information. We use a small number of companies to run the service for us:</P>
          <L items={[
            'Stripe, to take payments and process refunds.',
            'Brevo, to send ticket and confirmation emails.',
            'DN3 Events, which provides the ticketing system, and Railway, which hosts it and its database.',
            'Event staff at the door, who can see your name and ticket when they scan it.',
          ]} />
          <P>
            If any of these handle data outside the UK, we rely on approved safeguards such as the UK International
            Data Transfer Agreement or an adequacy decision.
          </P>

          <H>How long we keep it</H>
          <P>
            We keep your order details for {RETENTION_MONTHS / 12} years after the event, for accounts, refunds and
            queries. After that your name, email and postcode are removed. If you opted in to news, we keep your
            email for that purpose until you unsubscribe.
          </P>

          <H>Your rights</H>
          <P>You can ask us to:</P>
          <L items={[
            'give you a copy of the information we hold about you;',
            'correct anything that is wrong;',
            'erase your information (we may need to keep some records for tax purposes);',
            'stop using your information for news and updates, or withdraw your consent at any time.',
          ]} />
          <P>
            To do any of this, email <a className="text-indigo-600 underline" href={`mailto:${email}`}>{email}</a>.
            We will reply within one month. If you are unhappy with how we handle your information, you can complain
            to the Information Commissioner&rsquo;s Office at{' '}
            <a className="text-indigo-600 underline" href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a>{' '}
            or on 0303 123 1113.
          </P>
        </div>
      </div>
    </div>
  )
}
