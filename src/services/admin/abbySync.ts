import { prisma } from "@/lib/prisma";

export interface AbbyContact {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (const c of line) {
    if (c === '"') inQuotes = !inQuotes;
    else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

export function parseAbbyContactsCsv(raw: string): AbbyContact[] {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(",");

  return lines
    .slice(1)
    .map((line) => {
      const cols = splitCsvLine(line);
      const get = (name: string) => {
        const idx = header.indexOf(name);
        return idx >= 0 ? (cols[idx] ?? "").trim() : "";
      };
      return {
        firstName: get("Prénom"),
        lastName: get("Nom"),
        email: get("Email") || null,
        phone: (get("Téléphone") || "").replace(/^'/, "") || null,
        address: [get("Adresse"), get("Complément adresse")].filter(Boolean).join(", ") || null,
      };
    })
    .filter((c) => c.firstName || c.lastName);
}

export interface SyncResultRow {
  name: string;
  matched: boolean;
  clientId?: string;
  fieldsUpdated: string[];
}

export async function syncClientsFromAbbyContacts(contacts: AbbyContact[]): Promise<SyncResultRow[]> {
  const clients = await prisma.client.findMany();
  const results: SyncResultRow[] = [];

  for (const contact of contacts) {
    const name = `${contact.firstName} ${contact.lastName}`.trim();
    const match = clients.find(
      (c) =>
        c.firstName.toLowerCase().trim() === contact.firstName.toLowerCase().trim() &&
        c.lastName.toLowerCase().trim() === contact.lastName.toLowerCase().trim()
    );

    if (!match) {
      results.push({ name, matched: false, fieldsUpdated: [] });
      continue;
    }

    const data: { email?: string; phone?: string; address?: string } = {};
    const fieldsUpdated: string[] = [];
    if (!match.email && contact.email) {
      data.email = contact.email;
      fieldsUpdated.push("email");
    }
    if (!match.phone && contact.phone) {
      data.phone = contact.phone;
      fieldsUpdated.push("téléphone");
    }
    if (!match.address && contact.address) {
      data.address = contact.address;
      fieldsUpdated.push("adresse");
    }

    if (fieldsUpdated.length > 0) {
      await prisma.client.update({ where: { id: match.id }, data });
    }

    results.push({ name, matched: true, clientId: match.id, fieldsUpdated });
  }

  return results;
}
