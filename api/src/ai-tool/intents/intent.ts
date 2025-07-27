import { PaymentStatus, DeliveryStatus } from 'src/orders/dto/create-order.dto';
import { AppointmentStatus } from 'src/appointments/dto/create-appointment.dto';
import { DetectedQuery, QueryKind } from '../interfaces/query-kinds';

export type ArgExtractor = (
  match: RegExpMatchArray | null,
  prompt: string,
) => Record<string, any>;

export interface IntentDef {
  kind: QueryKind;
  patterns: Array<string | RegExp>;
  extractArgs?: ArgExtractor;
}

const toLower = (s: string) => s.toLowerCase().trim();

/**
 * Helpful mappers for enums from user text
 */
const paymentStatusFromPrompt = (p: string): PaymentStatus | undefined => {
  if (p.includes('pending') || p.includes('unpaid'))
    return PaymentStatus.PENDING;
  if (p.includes('paid') || p.includes('completed')) return PaymentStatus.PAID;
  return undefined;
};

const deliveryStatusFromPrompt = (p: string): DeliveryStatus | undefined => {
  if (p.includes('delivered')) return DeliveryStatus.DELIVERED;
  if (p.includes('shipped')) return DeliveryStatus.SHIPPED;
  if (p.includes('processing') || p.includes('in progress'))
    return DeliveryStatus.PROCESSING;
  return undefined;
};

import { ConsultationType } from 'src/appointments/dto/create-appointment.dto';

const consultationTypeFromPrompt = (
  p: string,
): ConsultationType | undefined => {
  if (p.includes('virtual') || p.includes('online'))
    return ConsultationType.VIRTUAL;
  if (
    p.includes('physical') ||
    p.includes('in-person') ||
    p.includes('in person')
  )
    return ConsultationType.IN_PERSON;
  return undefined;
};

export const INTENT_PATTERNS: IntentDef[] = [
  // ----------------------------------------------------------------
  // DOCTORS
  // ----------------------------------------------------------------
  {
    kind: 'doctor:all',
    patterns: [
      /(?:show|list|get|give|display).*(?:all|available).*(?:doctor|physician|dr)/i,
      /(?:what|which).*(?:doctor|physician).*(?:do (?:you|we) have|available|on (?:the )?platform)/i,
      /(?:list|show).*(?:doctor|physician).*(?:in|on).*mediconnect/i,
      /(?:all|available).*(?:doctor|physician|dr)/i,
      /doctor.*(?:list|available)/i,
      /who.*(?:doctor|physician).*(?:available|here)/i,
      /(?:doctor|physician).*(?:available.*today|today.*available)/i, // ← ADD THIS
    ],
  },
  {
    kind: 'doctor:bySpecialization',
    patterns: [
      /(?:find|show|list|get|do (?:you|we) have).*(?:doctor|dr|physician|specialist).*(?:speciali[sz]ation|speciali[sz]es? in|who (?:is|are)).*?([a-z]+(?:olog(?:y|ist)|iatri(?:c|st)|ics?))/i,
      /(?:is there|do (?:you|we) have).*?([a-z]+(?:olog(?:y|ist)|iatri(?:c|st)|ics?)).*(?:doctor|specialist)/i,
      /([a-z]+(?:olog(?:y|ist)|iatri(?:c|st)|ics?)).*(?:doctor|specialist|physician)/i,
      // Specific medical fields
      /(?:heart|cardiac).*(?:doctor|specialist)/i, // -> cardiology
      /(?:skin|dermat).*(?:doctor|specialist)/i, // -> dermatology
      /(?:bone|orthop).*(?:doctor|specialist)/i, // -> orthopedics
      /(?:brain|neuro).*(?:doctor|specialist)/i, // -> neurology
      /(?:eye|vision|ophth).*(?:doctor|specialist)/i,
    ],
    extractArgs: (m) => ({ specialization: m?.[1]?.trim() }),
  },
  {
    kind: 'doctor:byName',
    patterns: [
      /(?:doctor|dr|physician)\s+(\w+(?:\s+\w+)*)/i,
      /(?:find|show|get).*(?:doctor|dr|physician).*(?:named?|called)\s*(\w+(?:\s+\w+)*)/i,
      /(?:is|does).*(?:doctor|dr|physician)\s+(\w+(?:\s+\w+)*).*(?:available|work|practice)/i,
      /(?:what.*days?|when).*(?:is|does).*(?:doctor|dr|physician)\s+(\w+(?:\s+\w+)*).*(?:available|work)/i, // ← ADD THIS
      /(\w+(?:\s+\w+)*).*(?:doctor|dr|physician).*(?:available|schedule|days?)/i, // ← ADD THIS
    ],
    extractArgs: (match, prompt) => {
      const name = match?.[1]?.trim() || '';
      return { name };
    },
  },

  // ----------------------------------------------------------------
  // ORDERS
  // ----------------------------------------------------------------
  {
    kind: 'orders:paymentStatus',
    patterns: [
      /(?:unpaid|pending|outstanding).*order(?:s)?/i,
      /order(?:s)?.*(?:unpaid|pending|outstanding|not paid)/i,
      /(?:paid|completed).*order(?:s)?/i,
      /order(?:s)?.*(?:paid|completed|payment)/i,
    ],
    extractArgs: (_m, p) => {
      const lower = toLower(p);
      const status = paymentStatusFromPrompt(lower) ?? PaymentStatus.PENDING;
      return { status };
    },
  },
  {
    kind: 'orders:deliveryStatus',
    patterns: [
      /delivered orders?/i,
      /shipped orders?/i,
      /processing orders?/i,
      /in progress orders?/i,
    ],
    extractArgs: (_m, p) => {
      const lower = toLower(p);
      const status =
        deliveryStatusFromPrompt(lower) ?? DeliveryStatus.DELIVERED;
      return { status };
    },
  },
  {
    kind: 'orders:all',
    patterns: [
      /(?:my|show|list).*(?:appointment|visit)(?:s)?/i,
      /appointment.*(?:history|list)/i,
      /(?:past|previous).*(?:appointment|visit)(?:s)?/i,
    ],
  },

  // ----------------------------------------------------------------
  // APPOINTMENTS
  // ----------------------------------------------------------------
  {
    kind: 'appointments:upcoming',
    patterns: [
      /(?:next|upcoming|future).*(?:appointment|visit|consultation)/i,
      /(?:when|what time).*(?:my|next).*(?:appointment|visit)/i,
      /(?:do i have|is there).*(?:appointment|visit)/i,
      /appointment.*(?:scheduled|coming|next)/i,
    ],
  },
  {
    kind: 'appointments:status',
    patterns: [
      /recent (?:appointment|visit)/i,
      /past (?:appointment|visit)/i,
      /appointment history/i,
      /completed appointments?/i,
    ],
    extractArgs: () => ({ status: AppointmentStatus.COMPLETED }),
  },
  {
    kind: 'appointments:consultationType',
    patterns: [
      /virtual (?:appointments?|consultations?)/i,
      /online (?:appointments?|consultations?)/i,
      /in[ -]?person (?:appointments?|consultations?)/i,
      /physical (?:appointments?|consultations?)/i,
    ],
    extractArgs: (_m, p) => {
      const ct = consultationTypeFromPrompt(toLower(p));
      return ct ? { consultationType: ct } : {};
    },
  },

  // ----------------------------------------------------------------
  // PAYMENTS
  // ----------------------------------------------------------------
  {
    kind: 'payments:status',
    patterns: [
      /pending payments?/i,
      /unpaid bills?/i,
      /unpaid payments?/i,
      /paid payments?/i,
      /completed payments?/i,
    ],
    extractArgs: (_m, p) => {
      const lower = toLower(p);
      const status = paymentStatusFromPrompt(lower) ?? PaymentStatus.PENDING;
      return { status };
    },
  },
  {
    kind: 'payments:all',
    patterns: [
      'payments',
      'payment history',
      /show (?:my )?payments?/i,
      /my bills?/i,
      /invoices?/i,
    ],
  },

  // ----------------------------------------------------------------
  // DIAGNOSES / PRESCRIPTIONS
  // ----------------------------------------------------------------
  {
    kind: 'diagnoses:latest',
    patterns: [
      /(?:latest|recent|last|current).*(?:diagnosis|condition|prescription|medication)/i,
      /(?:what|which).*(?:diagnosis|condition|prescription).*(?:do i have|current)/i,
      /my.*(?:current|latest).*(?:diagnosis|prescription|medication)/i,
    ],
  },
  {
    kind: 'diagnoses:all',
    patterns: [
      /(?:my|show|list).*(?:diagnosis|diagnoses|prescription|medication|medical history)/i,
      /(?:what|which).*(?:diagnosis|condition|prescription).*(?:do i have|history)/i,
      /medical.*(?:history|record)/i,
    ],
  },

  // ----------------------------------------------------------------
  // PHARMACY STOCK (expanded coverage)
  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  // PHARMACY STOCK (expanded coverage + natural questions)
  // ----------------------------------------------------------------
  {
    kind: 'stock:all',
    patterns: [
      /(?:show|list|what|display|see).*(?:all|available).*(?:stock|medication|medicine|drug)/i,
      /(?:what|which).*(?:medication|medicine|drug).*(?:do (?:you|we) have|available|in stock)/i,
      /pharmacy.*(?:stock|inventory)/i,
      /all.*(?:medication|medicine|drug|stock)/i,
      /medication.*(?:list|available)/i,
    ],
  },
  {
    kind: 'stock:oneById',
    patterns: [/\b(?:stock|medication)\s*(?:id|code)\s*([a-z0-9-]+)\b/i],
    extractArgs: (m) => ({ id: m?.[1]?.trim() }),
  },
  {
    kind: 'stock:byName',
    patterns: [
      /(?:do (?:you|we) (?:have|stock|carry)|is there|can i (?:get|find|buy)).*?([a-z][a-z0-9\s\-]{2,50})(?:\s+(?:available|in stock|medicine|medication|drug|tablet|pill))?/i,
      /(?:availability|stock) (?:of|for).*?([a-z][a-z0-9\s\-]{2,50})/i,
      /(?:find|search|look for|check).*?([a-z][a-z0-9\s\-]{2,50})(?:\s+(?:medicine|medication|drug|stock))?/i,
      /(?:medicine|medication|drug|tablet|pill).*?([a-z][a-z0-9\s\-]{2,50})/i,
      /([a-z][a-z0-9\s\-]{2,50})\s+(?:available|in stock|stock)/i,
    ],
    extractArgs: (m) => ({ name: m?.[1]?.trim() }),
  },
  {
    kind: 'stock:byManufacturer',
    patterns: [
      /\b(?:manufacturer|made by)\s+([a-z0-9 \-]+)\b/i,
      /stock .*manufacturer (.+)/i,
    ],
    extractArgs: (m) => ({ manufacturer: m?.[1]?.trim() }),
  },
  {
    kind: 'stock:byCategory',
    patterns: [
      /stock .*category (.+)/i,
      /\bshow\s+([a-z0-9 \-]+)\s+category stock\b/i,
      /\bcategory\s+([a-z0-9 \-]+)\s+stock\b/i,
    ],
    extractArgs: (m) => ({ category: m?.[1]?.trim() }),
  },
  {
    kind: 'stock:byType',
    patterns: [/stock .*type (.+)/i, /\btype\s+([a-z0-9 \-]+)\s+stock\b/i],
    extractArgs: (m) => ({ type: m?.[1]?.trim() }),
  },
];

const EXTRACTORS = {
  extractMedicationName: (match: RegExpMatchArray, prompt: string): string => {
    // Try to extract from regex match first
    const name = match?.[1]?.trim();
    if (name && name.length > 2) return name;

    // Fallback: look for common medication patterns in the full prompt
    const medicationPatterns = [
      /\b([a-z]{3,}(?:cillin|mycin|pril|olol|ine|ate|ide))\b/i,
      /\b(para\w+|ibupro\w+|aspirin|tylenol|advil|motrin)\b/i,
      /\b([a-z]{4,})\s+(?:tablet|pill|capsule|mg|ml)\b/i,
    ];

    for (const pattern of medicationPatterns) {
      const medMatch = prompt.match(pattern);
      if (medMatch?.[1]) return medMatch[1].trim();
    }

    return name || '';
  },

  extractDoctorName: (match: RegExpMatchArray, prompt: string): string => {
    let name = match?.[1]?.trim();
    if (!name) return '';

    // Clean up common artifacts
    name = name.replace(/\b(?:who|is|are|available|there)\b/gi, '').trim();

    // Validate it looks like a name (has at least 2 characters, starts with letter)
    if (name.length < 2 || !/^[a-z]/i.test(name)) return '';

    return name;
  },

  extractSpecialization: (match: RegExpMatchArray, prompt: string): string => {
    const spec = match?.[1]?.trim();

    // Map common terms to proper specializations
    const specializationMap: Record<string, string> = {
      heart: 'cardiology',
      cardiac: 'cardiology',
      skin: 'dermatology',
      dermat: 'dermatology',
      bone: 'orthopedics',
      orthop: 'orthopedics',
      brain: 'neurology',
      neuro: 'neurology',
      eye: 'ophthalmology',
      vision: 'ophthalmology',
      ophth: 'ophthalmology',
    };

    const lowerSpec = spec?.toLowerCase();
    return specializationMap[lowerSpec] || spec || '';
  },
};

export function detectQueryFromPrompt(prompt: string): DetectedQuery {
  const cleanPrompt = prompt.trim().toLowerCase();

  // Try each intent pattern
  for (const intent of INTENT_PATTERNS) {
    for (const pattern of intent.patterns) {
      const match = prompt.match(pattern);
      if (match) {
        const confidence = calculateConfidence(match, prompt, intent.kind);

        return {
          kind: intent.kind,
          args: extractArgumentsForIntent(intent.kind, match, prompt),
          confidence,
          fallbackQueries: getFallbackQueries(intent.kind, prompt),
        };
      }
    }
  }

  // Fallback if no intent matched
  return createFallbackQuery(prompt);
}

function extractArgumentsForIntent(
  intentKey: string,
  match: RegExpMatchArray,
  prompt: string,
): Record<string, any> {
  switch (intentKey) {
    case 'doctor:byName':
      return { name: EXTRACTORS.extractDoctorName(match, prompt) };

    case 'doctor:bySpecialization':
      return {
        specialization: EXTRACTORS.extractSpecialization(match, prompt),
      };

    case 'stock:byName':
      return { name: EXTRACTORS.extractMedicationName(match, prompt) };

    case 'orders:paymentStatus': {
      const paymentStatus =
        prompt.includes('paid') || prompt.includes('completed')
          ? PaymentStatus.PAID
          : PaymentStatus.PENDING;
      return { status: paymentStatus };
    }

    case 'orders:deliveryStatus': {
      let deliveryStatus = DeliveryStatus.PROCESSING;
      if (prompt.includes('delivered'))
        deliveryStatus = DeliveryStatus.DELIVERED;
      else if (prompt.includes('shipped'))
        deliveryStatus = DeliveryStatus.SHIPPED;
      return { status: deliveryStatus };
    }

    default:
      return {};
  }
}

function calculateConfidence(
  match: RegExpMatchArray,
  prompt: string,
  intentKey: string,
): number {
  let confidence = 0.7; // Base confidence

  // Boost confidence for longer matches
  if (match[0] && match[0].length > prompt.length * 0.5) {
    confidence += 0.2;
  }

  // Boost confidence for specific keywords
  const keywordBoosts: Record<string, string[]> = {
    'doctor:byName': ['doctor', 'dr', 'physician'],
    'doctor:bySpecialization': ['specialist', 'specialization', 'specializes'],
    'stock:byName': ['medication', 'medicine', 'drug', 'available', 'stock'],
    'stock:all': ['list', 'show', 'all', 'available'],
  };

  const keywords = keywordBoosts[intentKey] || [];
  for (const keyword of keywords) {
    if (prompt.toLowerCase().includes(keyword)) {
      confidence += 0.1;
    }
  }

  return Math.min(confidence, 1.0);
}

function getFallbackQueries(intentKey: string, prompt: string): QueryKind[] {
  // Suggest alternative queries if primary intent fails
  const fallbacks: Record<string, QueryKind[]> = {
    'doctor:byName': ['doctor:bySpecialization', 'doctor:all'],
    'doctor:bySpecialization': ['doctor:byName', 'doctor:all'],
    'stock:byName': ['stock:all'],
    'orders:paymentStatus': ['orders:all'],
    'appointments:upcoming': ['appointments:status'],
  };

  return fallbacks[intentKey] || [];
}

function createFallbackQuery(prompt: string): DetectedQuery {
  const lowerPrompt = prompt.toLowerCase();

  // Smart fallbacks based on keywords
  if (lowerPrompt.includes('doctor') || lowerPrompt.includes('physician')) {
    return {
      kind: 'doctor:all',
      args: { specialization: 'general' },
      confidence: 0.3,
    };
  }

  if (
    lowerPrompt.includes('medication') ||
    lowerPrompt.includes('medicine') ||
    lowerPrompt.includes('drug')
  ) {
    return {
      kind: 'stock:all',
      args: {},
      confidence: 0.4,
    };
  }

  if (lowerPrompt.includes('order')) {
    return {
      kind: 'orders:all',
      args: {},
      confidence: 0.4,
    };
  }

  if (lowerPrompt.includes('appointment')) {
    return {
      kind: 'appointments:all',
      args: {},
      confidence: 0.4,
    };
  }

  // Ultimate fallback
  return {
    kind: 'diagnoses:all',
    args: {},
    confidence: 0.1,
  };
}
