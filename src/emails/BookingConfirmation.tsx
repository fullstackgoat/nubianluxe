import {
  Html, Head, Body, Container, Section, Text, Heading,
  Hr, Row, Column, Button, Img,
} from "@react-email/components";

interface Props {
  clientName: string;
  service: string;
  tier: string;
  date: Date;
  appointmentId: string;
}

const gold = "#C9A84C";
const obsidian = "#0A0A0A";
const ivory = "#F5F0E8";

export default function BookingConfirmationEmail({ clientName, service, tier, date, appointmentId }: Props) {
  const dateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(date);
  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(date);

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: obsidian, fontFamily: "Georgia, serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>

          {/* Header */}
          <Section style={{ textAlign: "center", paddingBottom: 32 }}>
            <Text style={{ color: gold, fontSize: 11, letterSpacing: 6, textTransform: "uppercase", margin: 0 }}>
              NUBIAN LUXE BRAIDING LOUNGE
            </Text>
            <Heading style={{ color: "#ffffff", fontSize: 42, fontWeight: 300, margin: "8px 0 0", fontStyle: "italic" }}>
              You&rsquo;re Confirmed
            </Heading>
            <div style={{ width: 64, height: 1, background: gold, margin: "16px auto 0" }} />
          </Section>

          {/* Greeting */}
          <Section style={{ backgroundColor: "#111111", borderRadius: 12, padding: "28px 32px", marginBottom: 20 }}>
            <Text style={{ color: ivory, fontSize: 16, lineHeight: 1.7, margin: 0 }}>
              Hi {clientName},
            </Text>
            <Text style={{ color: "rgba(245,240,232,0.7)", fontSize: 15, lineHeight: 1.7, margin: "12px 0 0" }}>
              Your appointment has been confirmed and your deposit has been received. We&rsquo;re
              so excited to serve you at Nubian Luxe Braiding Lounge.
            </Text>
          </Section>

          {/* Appointment details */}
          <Section style={{ backgroundColor: "#111111", borderRadius: 12, padding: "28px 32px", marginBottom: 20 }}>
            <Text style={{ color: gold, fontSize: 10, letterSpacing: 4, textTransform: "uppercase", margin: "0 0 16px" }}>
              Appointment Details
            </Text>
            {[
              { label: "Service",  value: service },
              { label: "Tier",     value: tier.charAt(0) + tier.slice(1).toLowerCase() },
              { label: "Date",     value: dateStr },
              { label: "Time",     value: timeStr },
              { label: "Location", value: "The Woodlands / Spring, TX (Address sent separately)" },
              { label: "Ref #",    value: appointmentId.slice(-8).toUpperCase() },
            ].map(({ label, value }) => (
              <Row key={label} style={{ marginBottom: 10 }}>
                <Column style={{ width: 100 }}>
                  <Text style={{ color: "rgba(245,240,232,0.4)", fontSize: 12, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>
                    {label}
                  </Text>
                </Column>
                <Column>
                  <Text style={{ color: ivory, fontSize: 14, margin: 0, fontWeight: 500 }}>
                    {value}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          {/* Policy reminder */}
          <Section style={{ backgroundColor: "#1a1a1a", borderRadius: 12, padding: "24px 32px", borderLeft: `3px solid ${gold}`, marginBottom: 24 }}>
            <Text style={{ color: gold, fontSize: 10, letterSpacing: 4, textTransform: "uppercase", margin: "0 0 12px" }}>
              Important Reminders
            </Text>
            {[
              "Please arrive with clean, detangled hair or add Braid Prep / Detangling service.",
              "A 48-hour notice is required to reschedule. Deposits are transferable within 21 days.",
              "Your $44 deposit will be applied to your total at the appointment.",
              "Payment checkpoint at ~80% service completion.",
            ].map((note, i) => (
              <Text key={i} style={{ color: "rgba(245,240,232,0.65)", fontSize: 13, lineHeight: 1.6, margin: "0 0 6px" }}>
                · {note}
              </Text>
            ))}
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: "center", marginBottom: 32 }}>
            <Text style={{ color: "rgba(245,240,232,0.5)", fontSize: 13, marginBottom: 16 }}>
              Questions? Text us directly — we respond fast.
            </Text>
            <Button
              href="sms:3464590146"
              style={{
                backgroundColor: gold,
                color: obsidian,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
                padding: "14px 32px",
                borderRadius: 4,
                textDecoration: "none",
              }}
            >
              Text 346-459-0146
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={{ borderColor: "rgba(201,168,76,0.15)", margin: "0 0 24px" }} />
          <Text style={{ color: "rgba(245,240,232,0.3)", fontSize: 11, textAlign: "center", lineHeight: 1.6 }}>
            Nubian Luxe Braiding Lounge · The Woodlands / Spring, TX<br />
            &ldquo;Honoring the Craft. Elevating the Experience.&rdquo;
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
