export default function CheckoutHero() {
  return <section className="rtr-checkout-hero" aria-label="Raise the Roof Festival">
    <div className="rtr-checkout-hero-copy">
      <p className="rtr-checkout-eyebrow">30 July - 1 August 2027 · North Yorkshire</p>
      <h1>Your next<br /><span>weekend away.</span></h1>
      <p className="rtr-checkout-intro">Raise the Roof Festival. Rooftop camping, music and time together at Scampston Hall.</p>
      <div className="rtr-checkout-partner"><span>In partnership with</span><img src="/checkout/tentbox-logo.png" alt="TentBox" /></div>
      <a href="#booking-form" onClick={e => {e.preventDefault(); document.getElementById('booking-form')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'})}} className="rtr-checkout-jump">Choose your tickets <span aria-hidden="true">↓</span></a>
    </div>
    <figure className="rtr-checkout-photo"><img src="/checkout/tentbox-community.jpg" alt="Rooftop campers at a TentBox community camping event" /><figcaption>Photo: TentBox community event. Not the festival venue.</figcaption></figure>
  </section>
}
