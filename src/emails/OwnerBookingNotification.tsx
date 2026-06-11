import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
  Button,
} from "@react-email/components";

interface Props {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  serviceCategory: string;
  servicePrice: string;
  tier: string;
  tierFee: string;
  deposit: string;
  date: string;
  time: string;
  duration: string;
  notes?: string | null;
  hairColor?: string | null;
  appointmentId: string;
  paidServiceUpfront: boolean;
  adminUrl: string;
}

const gold = "#C9A84C";
const obsidian = "#0A0A0A";
const ivory = "#F5F0E8";

export default function OwnerBookingNotificationEmail({
  clientName,
  clientEmail,
  clientPhone,
  service,
  serviceCategory,
  servicePrice,
  tier,
  tierFee,
  deposit,
  date,
  time,
  duration,
  notes,
  hairColor,
  appointmentId,
  paidServiceUpfront,
  adminUrl,
}: Props) {
  const rows = [
    { label: "Client", value: clientName },
    { label: "Email", value: clientEmail },
    { label: "Phone", value: clientPhone },
    { label: "Service", value: service },
    { label: "Category", value: serviceCategory },
    { label: "Service price", value: servicePrice },
    { label: "Tier", value: tier },
    { label: "Tier fee", value: tierFee },
    { label: "Deposit", value: deposit },
    { label: "Date", value: date },
    { label: "Time", value: time },
    { label: "Duration", value: duration },
    ...(hairColor ? [{ label: "Hair color", value: hairColor }] : []),
    { label: "Payment", value: paidServiceUpfront ? "Service paid in full now" : "Deposit + fees paid now" },
    { label: "Ref #", value: appointmentId.slice(-8).toUpperCase() },
  ];

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: obsidian, fontFamily: "Georgia, serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
          <Section style={{ textAlign: "center", paddingBottom: 24 }}>
            <Text style={{ color: gold, fontSize: 11, letterSpacing: 6, textTransform: "uppercase", margin: 0 }}>
              NUBIAN LUXE BRAIDING LOUNGE
            </Text>
            <Heading style={{ color: "#ffffff", fontSize: 34, fontWeight: 300, margin: "8px 0 0", fontStyle: "italic" }}>
              New Booking Received
            </Heading>
            <div style={{ width: 64, height: 1, background: gold, margin: "16px auto 0" }} />
          </Section>

          <Section style={{ backgroundColor: "#111111", borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
            <Text style={{ color: ivory, fontSize: 15, lineHeight: 1.7, margin: "0 0 8px" }}>
              A client completed checkout and payment cleared. Review the appointment in admin and confirm when ready.
            </Text>
          </Section>

          <Section style={{ backgroundColor: "#111111", borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
            <Text style={{ color: gold, fontSize: 10, letterSpacing: 4, textTransform: "uppercase", margin: "0 0 16px" }}>
              Booking Details
            </Text>
            {rows.map(({ label, value }) => (
              <Row key={label} style={{ marginBottom: 10 }}>
                <Column style={{ width: 110 }}>
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
            {notes?.trim() ? (
              <>
                <Hr style={{ borderColor: "rgba(201,168,76,0.15)", margin: "16px 0" }} />
                <Text style={{ color: gold, fontSize: 10, letterSpacing: 4, textTransform: "uppercase", margin: "0 0 8px" }}>
                  Client Notes
                </Text>
                <Text style={{ color: ivory, fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                  {notes.trim()}
                </Text>
              </>
            ) : null}
          </Section>

          <Section style={{ textAlign: "center", marginBottom: 24 }}>
            <Button
              href={adminUrl}
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
              Open Admin Dashboard
            </Button>
          </Section>

          <Hr style={{ borderColor: "rgba(201,168,76,0.15)", margin: "0 0 24px" }} />
          <Text style={{ color: "rgba(245,240,232,0.3)", fontSize: 11, textAlign: "center", lineHeight: 1.6 }}>
            Nubian Luxe Braiding Lounge · Owner booking notification
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
