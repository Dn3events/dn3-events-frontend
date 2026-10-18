# Flat booking fee - review only

No live setting or order changes. Await confirmation of business edge cases and merge/deploy approval.

Adds nullable feePerTicket. When set, replaces the legacy fixed-per-order plus percentage fee; feesPassedOn=false still absorbs the fee. Existing events remain on legacy behavior until explicitly configured. Proposed RTR activation is feePerTicket=1.50 after approval, not an automatic migration change. Legacy settings remain for other events.

Provisional rules requiring confirmation: zero-price lines and completely discounted baskets stay fee-free; positive-price tickets in a partly discounted basket retain the full per-ticket fee, including trader extras. No per-line allocation of basket discounts. Historical paid AND pending orders retain their saved totals and Stripe session prices; new quote settings apply only to new orders.

Single pricing function drives quote, saved order and Stripe line items. Booking fee appears as its own Stripe line. Confirmation screen and ticket email now display saved ticket subtotal, discount, booking fee and total. Organiser Sales details already use saved amounts. No recalculation on display/resend. Ticket PDFs remain entry documents rather than VAT receipts.

164 tests pass, including legacy-preservation, £5/£15/£25/£65/£75, quantity scaling, mixed/free/discount/absorbed fees, stored-order invariance, Stripe quote agreement and receipt email breakdown. Isolated browser verified £75 -> £76.50, two -> £153 and saved receipt display. No external payments/mail.

Stripe public standard UK-card pricing checked at https://stripe.com/gb/pricing and https://stripe.com/gb/pricing/local-payment-methods : 1.5% + 20p, premium UK 2.8% + 20p. £6.50 transaction: approximately 30p standard, fee remainder £1.20; £76.50: £1.35, remainder 15p. Premium equivalents 38p/£2.34, remainder £1.12/-84p. Illustrative per-transaction rounding, before other costs/tax. Not a verified account-specific contract and not a promise every payment method is covered.
